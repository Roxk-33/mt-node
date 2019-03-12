'use strict';

module.exports = app => {
	const { STRING, INTEGER, FLOAT, BIGINT, UUID } = app.Sequelize;
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
					if (val && val.length === 0) this.setDataValue('spec_text', '');
					else this.setDataValue('spec_text', val.join(','));
				},
				get() {
					let specText = this.getDataValue('spec_text');
					if (specText && specText.length) return specText.split(',');
					return [];
				},
			},
			food_picture: STRING,
			food_name: STRING,
			num: INTEGER,
			price: FLOAT,
		},
		{
			timezone: '+08:00', //东八时区
			tableName: 'order_item',
		},
	);
	orderItem.associate = function() {
		orderItem.belongsTo(app.model.orderList, {
			foreignKey: 'order_id',
			targetKey: 'id',
		});
	};
	orderItem.createOrderFood = function(data, t) {
		return this.create(data, { transaction: t });
	};
	return orderItem;
};
