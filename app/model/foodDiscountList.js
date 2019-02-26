'use strict';

module.exports = app => {
	const { DATE, INTEGER, BIGINT, FLOAT } = app.Sequelize;

	const discountList = app.model.define(
		'discountList',
		{
			id: {
				type: INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			food_id: BIGINT,
			discount: FLOAT,
			original: FLOAT,
			created_at: DATE,
			updated_at: DATE
		},
		{
			timezone: '+08:00', //东八时区
			tableName: 'food_discount_list'
		}
	);

	discountList.createItem = function(data) {
		return this.create(data);
	};
	discountList.deleteItem = function(foodId) {
		return this.destory({ where: { food_id: foodId } });
	};
	discountList.updateItem = function(id, updateData) {
		return this.update(updateData, { where: { food_id: id } });
	};
	return discountList;
};
