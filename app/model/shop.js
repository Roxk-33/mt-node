'use strict';

module.exports = app => {
	const { STRING, INTEGER, FLOAT, TEXT, DOUBLE, DATE } = app.Sequelize;
	const Op = app.Sequelize.Op;
	const Shop = app.model.define(
		'shop',
		{
			id: {
				type: INTEGER,
				primaryKey: true,
				autoIncrement: true,
				unique: true,
			},
			month_sale: {
				type: DOUBLE,
				defaultValue: 0,
			},
			shop_title: STRING,
			threshold: FLOAT, //  门槛
			freight: FLOAT, //  配送费
			longitude: STRING,
			privince: INTEGER,
			city: INTEGER,
			area: INTEGER,
			latitude: STRING,
			species: { type: INTEGER, allowNull: false, defaultValue: 1 }, //  种类
			announcement: TEXT, //  公告
			geohash: STRING,
			address: TEXT, //  地址
			photo: STRING, //  照片
			tel: STRING, //  电话
			rate: FLOAT, //  商家评分
			taste_rate: FLOAT, //  口味评分
			packing_rate: FLOAT, //  包装评分
			business_hours: DATE, // 开业时间
			closing_hours: DATE, // 休业时间
		},
		{
			timestamps: false,
			tableName: 'shop',
		},
	);
	Shop.associate = function() {
		Shop.hasMany(app.model.Food, {
			foreignKey: 'shop_id',
			sourceKey: 'id',
			as: 'food_list',
		});
		Shop.hasMany(app.model.OrderList, {
			foreignKey: 'shop_id',
			sourceKey: 'id',
		});
		Shop.hasMany(app.model.CartList, {
			foreignKey: 'shop_id',
			sourceKey: 'id',
		});
		Shop.hasMany(app.model.ShopCatalog, {
			foreignKey: 'shop_id',
			sourceKey: 'id',
			as: 'category_list',
		});
	};

	Shop.getList = function() {
		return this.findAll({ limit: 10 });
	};
	Shop.getListByLoc = function(geohash, offset) {
		return this.findAll({ where: { geohash: { [Op.like]: geohash + '%' } }, offset, limit: 10 });
	};
	Shop.updateRate = function(data, id) {
		return this.update(data, { where: { id } });
	};
	Shop.updateMonthSale = function(id, t) {
		return app.model.query(`UPDATE shop set month_sale = month_sale + 1 where id = ${id}`, { transaction: t });
	};
	Shop.getDetail = function(id) {
		return this.findOne({
			where: {
				id: id,
			},
			include: [
				{
					model: app.model.Food,
					as: 'food_list',
					where: {
						shop_id: id,
						is_delete: 0,
					},
					include: [
						{
							model: app.model.FoodSpec,
							as: 'spec_arr',
						},
						{
							model: app.model.FoodDiscountList,
							attributes: ['discount', 'original'],
							as: 'discount_info',
						},
					],
				},
				{
					model: app.model.ShopCatalog,
					as: 'category_list',
					attributes: { exclude: ['shop_id'] },
				},
			],
		});
	};

	return Shop;
};
