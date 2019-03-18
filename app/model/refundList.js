'use strict';

module.exports = app => {
	const { DATE, INTEGER, BIGINT, TEXT } = app.Sequelize;

	const refundList = app.model.define(
		'refundList',
		{
			id: {
				type: INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			order_id: BIGINT,
			user_id: BIGINT,
			shop_id: BIGINT,
			created_at: DATE,
			updated_at: DATE,
			reason: TEXT,
			result: INTEGER,
		},
		{
			timezone: '+08:00', //东八时区
			tableName: 'refund_list',
		},
	);
	refundList.associate = function() {
		refundList.belongsTo(app.model.OrderList, {
			foreignKey: 'order_id',
			targetKey: 'id',
			as: 'order_info',
		});
		refundList.belongsTo(app.model.Shop, {
			foreignKey: 'shop_id',
			targetKey: 'id',
			as: 'shop_info',
		});
	};

	refundList.createItem = function(data, t) {
		return this.create(data, { transaction: t });
	};
	refundList.getList = function(condition, offset) {
		return this.findAll({
			where: condition,
			offset,
			limit: 10,
			order: [
				// 将转义标题，并根据有效的方向参数列表验证DESC
				['created_at', 'DESC'],
			],
			include: [
				{
					model: app.model.Shop,
					as: 'shop_info',
					attributes: ['photo', 'shop_title', 'id'],
				},
				{
					model: app.model.OrderList,
					as: 'order_info',
					include: [
						{
							model: app.model.OrderItem,
							as: 'food_list',
						},
						{
							model: app.model.OrderStatusTime,
							as: 'order_status',
						},
					],
				},
			],
		});
	};
	refundList.updateItem = function(id, updateData, t) {
		return this.update(updateData, { where: { order_id: id }, transaction: t });
	};
	return refundList;
};
