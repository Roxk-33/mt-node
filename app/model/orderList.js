'use strict';

module.exports = app => {
	const { STRING, INTEGER, FLOAT, TEXT, BIGINT, UUID } = app.Sequelize;
	const Op = app.Sequelize.Op;
	const orderList = app.model.define(
		'orderList',
		{
			id: {
				type: BIGINT,
				primaryKey: true,
				autoIncrement: true,
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
			// ONTHEWAY: '订单配送中',
			// ORDER_SUCCESS: '订单已完成,已送达',
			// ORDER_REFUNDING: '申请退款中',
			// ORDER_REFUND: '申请退款中',
			// ORDER_REFUND_FAIL_ONTHEWAY:'商家拒绝退款,商品配送中'
			// ORDER_CANCEL: '订单已取消',
			// ORDER_CANCEL_TIMEOUT: '订单已取消',
			status: { type: STRING, defaultValue: 'UNPAY' },
			freight: FLOAT,
		},
		{
			timezone: '+08:00', //东八时区
			tableName: 'order_list',
		},
	);

	orderList.associate = function() {
		orderList.hasMany(app.model.OrderItem, {
			foreignKey: 'order_id',
			sourceKey: 'id',
			as: 'food_list',
		});
		orderList.hasOne(app.model.OrderStatusTime, {
			foreignKey: 'order_id',
			sourceKey: 'id',
			as: 'order_status',
		});
		orderList.hasOne(app.model.OrderReview, {
			foreignKey: 'order_id',
			sourceKey: 'id',
			as: 'order_review',
		});
		orderList.belongsTo(app.model.Shop, {
			foreignKey: 'shop_id',
			targetKey: 'id',
			as: 'shop_info',
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
				['created_at', 'DESC'],
			],
			include: [
				{
					model: app.model.Shop,
					as: 'shop_info',
					attributes: ['photo', 'shop_title', 'id'],
				},
				{
					model: app.model.OrderItem,
					as: 'food_list',
				},
				{
					model: app.model.OrderStatusTime,
					as: 'order_status',
				},
			],
		});
	};
	orderList.geRefundList = function(userId, offset) {
		return this.findAll({
			where: {
				user_id: userId,
				status: {
					[Op.or]: ['ORDER_REFUNDING', 'ORDER_REFUND', 'ORDER_REFUND_FAIL_ONTHEWAY'],
				},
			},
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
					model: app.model.OrderItem,
					as: 'food_list',
				},
				{
					model: app.model.OrderStatusTime,
					as: 'order_status',
				},
			],
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
					attributes: ['deadline_pay_time'],
				},
				{
					model: app.model.Shop,
					as: 'shop_info',
					attributes: ['shop_title'],
				},
			],
		});
	};

	orderList.getDetail = function(condition) {
		return this.findOne({
			where: condition,
			include: [
				{
					model: app.model.Shop,
					as: 'shop_info',
				},
				{
					model: app.model.OrderItem,
					as: 'food_list',
				},
				{
					model: app.model.OrderStatusTime,
					as: 'order_status',
				},
				{
					model: app.model.OrderReview,
					as: 'order_review',
					attributes: ['packing_rate', 'remarks', 'rate', 'taste_rate'],
				},
			],
		});
	};

	return orderList;
};
