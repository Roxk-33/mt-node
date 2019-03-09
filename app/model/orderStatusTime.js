'use strict';

module.exports = app => {
	const { DATE, INTEGER, BIGINT } = app.Sequelize;

	const orderStatusTime = app.model.define(
		'orderStatusTime',
		{
			id: {
				type: INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			order_id: BIGINT,
			created_at: DATE,
			updated_at: DATE,
			pay_time: DATE,
			accept_time: DATE,
			send_time: DATE,
			complete_time: DATE,
			cancel_time: DATE,
			arrival_time: DATE,
			predict_arrival_time: DATE,
			deadline_pay_time: DATE,
			refund_fail_time: DATE, // 拒绝退款时间
			apply_refund_time: DATE, // 申请退款时间
			refund_time: DATE, // 退款时间
		},
		{
			timezone: '+08:00', //东八时区
			tableName: 'order_status_time',
		},
	);
	orderStatusTime.associate = function() {
		orderStatusTime.belongsTo(app.model.OrderList, {
			foreignKey: 'order_id',
			targetKey: 'id',
		});
	};

	orderStatusTime.createStatus = function(data, t) {
		return this.create(data, { transaction: t });
	};
	orderStatusTime.updateStatus = function(id, updateData, t) {
		return this.update(updateData, { where: { order_id: id }, transaction: t });
	};
	return orderStatusTime;
};
