'use strict';

module.exports = app => {
	const { STRING, INTEGER, FLOAT, TEXT, BIGINT, UUID } = app.Sequelize;

	const orderItem = app.model.define(
		'orderItem',
		{
			id: { type: BIGINT, primaryKey: true, autoIncrement: true },
			order_id: { type: BIGINT },
			food_id: { type: INTEGER, primaryKey: true },
			user_id: { type: UUID, allowNull: false },
			spec_text: {
				type: INTEGER,
				set(val) {
					if (val.length === 0) this.setDataValue('spec_text', '');
					else this.setDataValue('spec_text', val.join(','));
				},
				get() {
					let specText = this.getDataValue('spec_text');
					if (specText.length) return specText.split(',');
					return [];
				}
			},
			food_picture: STRING,
			food_name: STRING,
			num: INTEGER,
			price: FLOAT
		},
		{
			timestamps: false,
			tableName: 'order_item'
		}
	);
	const orderList = app.model.define(
		'orderList',
		{
			id: {
				type: BIGINT,
				primaryKey: true,
				autoIncrement: true
			},
			user_id: { type: UUID, primaryKey: true },
			shop_id: { type: INTEGER, allowNull: false },
			user_sex: { type: INTEGER, allowNull: false },
			tableware_num: { type: INTEGER, defaultValue: 0 },
			review_status: { type: INTEGER, defaultValue: 0 },
			address: { type: STRING, allowNull: false },
			remarks: { type: TEXT, allowNull: true },
			total_price: FLOAT,
			tel: STRING,
			user_name: STRING,

			// 订单状态
			// UNPAY: '等待支付',
			// PAY: '已支付',
			// ACCEPT: '商家已接单',
			// ONTHEWAY: '送达中',
			// ARRIVED: '已送达',
			// ORDER_SUCCESS: '订单已完成',
			// ORDER_REFUND: '申请退款中',
			// ORDER_CANCEL: '订单已取消',
			// ORDER_CANCEL_TIMEOUT: '订单已取消',
			status: { type: STRING, defaultValue: 'UNPAY' },
			freight: FLOAT
		},
		{
			timezone: '+08:00', //东八时区
			tableName: 'order_list'
		}
	);

	orderList.associate = function() {
		orderList.hasMany(orderItem, {
			foreignKey: 'order_id',
			sourceKey: 'id',
			as: 'food_list'
		});
		orderList.hasOne(app.model.OrderStatusTime, {
			foreignKey: 'order_id',
			sourceKey: 'id',
			as: 'order_status'
		});
		orderList.belongsTo(app.model.Shop, {
			foreignKey: 'shop_id',
			targetKey: 'id',
			as: 'shop_info'
		});
	};
	orderItem.associate = function() {
		orderItem.belongsTo(orderList, {
			foreignKey: 'order_id',
			targetKey: 'id'
		});
	};
	orderList.createOrder = function(data, t) {
		return this.create(data, { transaction: t });
	};
	orderList.changeOrderStatus = function(status, id, t) {
		return this.update({ status }, { where: { id }, transaction: t });
	};
	orderList.updateReview = function(id, t) {
		return this.update({ review_status: 1 }, { where: { id }, transaction: t });
	};
	orderList.getList = function(condition, offset) {
		return this.findAll({
			where: condition,
			offset,
			limit: 10,
			order: [
				// 将转义标题，并根据有效的方向参数列表验证DESC
				['created_at', 'DESC']
			],
			include: [
				{
					model: app.model.Shop,
					as: 'shop_info'
				},
				{
					model: orderItem,
					as: 'food_list'
				},
				{
					model: app.model.OrderStatusTime,
					as: 'order_status'
				}
			]
		});
	};
	orderList.getOrderPayInfo = function(id) {
		return orderList.findOne({
			where: { id },
			// raw: true,
			attributes: ['id', 'total_price'],
			// joinTableAttributes: ['shop_title'],
			include: [
				{
					model: app.model.OrderStatusTime,
					as: 'order_status',
					attributes: ['deadline_pay_time']
				},
				{
					model: app.model.Shop,
					as: 'shop_info',
					attributes: ['shop_title']
				}
			]
		});
	};
	orderList.createOrderFood = function(data, t) {
		return orderItem.create(data, { transaction: t });
	};
	orderList.getDetail = function(id) {
		return this.findOne({
			where: { id },
			include: [
				{
					model: app.model.Shop,
					as: 'shop_info'
				},
				{
					model: orderItem,
					as: 'food_list'
				},
				{
					model: app.model.OrderStatusTime,
					as: 'order_status'
				}
			]
		});
	};
	return orderList;
};
