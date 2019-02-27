'use strict';

module.exports = app => {
	const { STRING, INTEGER, TEXT, BIGINT, UUID } = app.Sequelize;

	const orderReview = app.model.define(
		'orderReview',
		{
			id: {
				type: INTEGER,
				primaryKey: true,
				autoIncrement: true,
				unique: true
			},
			order_id: BIGINT,
			user_id: UUID,
			shop_id: INTEGER,
			rate: INTEGER,
			packing_rate: INTEGER,
			taste_rate: INTEGER,
			distribution_type: INTEGER,
			distribution_rate: INTEGER,
			distribution_time: STRING,
			remarks: TEXT
		},
		{
			timezone: '+08:00', //东八时区
			tableName: 'order_reviews'
		}
	);
	orderReview.associate = function() {
		orderReview.belongsTo(app.model.Shop, {
			foreignKey: 'shop_id',
			sourceKey: 'id',
			as: 'shop_info'
		});
		orderReview.belongsTo(app.model.User, {
			foreignKey: 'user_id',
			sourceKey: 'id',
			as: 'user_info'
		});
	};

	orderReview.getList = function(id, offset) {
		return this.findAll({
			where: { user_id: id },
			offset,
			limit: 10,
			include: [
				{
					model: app.model.Shop,
					as: 'shop_info'
				}
			]
		});
	};
	orderReview.createReview = function(data, t) {
		return this.create(data, { transaction: t });
	};
	orderReview.getItem = function(data) {
		return this.findOne({ where: data });
	};
	orderReview.deleteItem = function(id) {
		return this.destroy({ where: { id } });
	};
	orderReview.getShopEvalList = function(id, offset) {
		return this.findAll({
			where: { shop_id: id },
			offset,
			limit: 10,
			include: [
				{
					model: app.model.User,
					as: 'user_info',
					attributes: ['user_name', 'avatar']
				}
			]
		});
	};
	return orderReview;
};
