'use strict';

module.exports = app => {
  const { STRING, INTEGER, FLOAT, TEXT, DOUBLE } = app.Sequelize;

  const Shop = app.model.define(
    'shop',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      shop_title: STRING,
      threshold: FLOAT, //  门槛
      freight: FLOAT, //  配送费
      longitude: FLOAT,
      privince: STRING,
      latitude: FLOAT,
      species: { type: INTEGER, allowNull: false, defaultValue: 1 }, //  种类
      announcement: TEXT, //  公告
      all_address: TEXT, //  地址
      photo: STRING, //  照片
      tel: STRING, //  电话
      total_sales: DOUBLE, //  月销
      rate: FLOAT, //  评分
    },
    {
      timestamps: false,
      tableName: 'shop',
    }
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
  };

  Shop.getList = function() {
    return this.findAll({ limit: 10 });
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
          },
          include: [
            {
              model: app.model.FoodSpec,
              as: 'spec_arr',
            },
          ],
        },
      ],
    });
  };

  return Shop;
};
