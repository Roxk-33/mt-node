'use strict';

module.exports = app => {
  const { STRING, INTEGER, FLOAT } = app.Sequelize;

  const CartList = app.model.define(
    'cartList',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      food_id: { type: INTEGER, primaryKey: true },
      user_id: { type: INTEGER, primaryKey: true },
      shop_id: { type: INTEGER, primaryKey: true },
      spec_id: STRING,
      food_name: STRING,
      num: INTEGER,
      spec_text: INTEGER,
      price: FLOAT,
    },
    {
      timestamps: false,
      tableName: 'cartlist',
    }
  );

  CartList.getList = function(id) {
    return this.findAll({ where: { user_id: id } });
  };
  CartList.pushItem = function(data) {
    return this.findOrCreate({
      where: { spec_id: data.spec_id, food_id: data.food_id },
      defaults: {
        shop_id: data.shop_id,
        food_id: data.food_id,
        user_id: data.user_id,
        spec_id: data.spec_id, // 以逗号分隔的规格id群组
        num: data.num,
        spec_text: data.spec_text,
        price: data.price,
        food_name: data.food_name,
      },
    });
  };
  CartList.updateNum = function(id, num) {
    return this.update({ num }, { where: { id } });
  };
  CartList.createItem = function(data) {
    return this.create({
      shop_id: data.shop_id,
      food_id: data.food_id,
      user_id: data.user_id,
      spec_id: data.spec_id, // 以逗号分隔的规格id群组
      num: data.num,
      spec_text: data.spec_text,
      price: data.price,
      food_name: data.food_name,
    });
  };
  return CartList;
};
