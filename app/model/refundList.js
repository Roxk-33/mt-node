'use strict';

module.exports = app => {
	const { DATE, INTEGER, BIGINT, TEXT } = app.Sequelize;

	const refundList = app.model.define(
		'refundList',
		{
			id: {
				type: INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			order_id: BIGINT,
			user_id: BIGINT,
			shop_id: BIGINT,
			created_at: DATE,
			updated_at: DATE,
			reason: TEXT,
			result: INTEGER
		},
		{
			timezone: '+08:00', //东八时区
			tableName: 'refund_list'
		}
	);
	refundList.associate = function() {
		refundList.belongsTo(app.model.OrderList, {
			foreignKey: 'order_id',
			targetKey: 'id'
		});
	};

	refundList.createItem = function(data, t) {
		return this.create(data, { transaction: t });
	};
	refundList.updateItem = function(id, updateData, t) {
		return this.update(updateData, { where: { order_id: id }, transaction: t });
	};
	return refundList;
};
