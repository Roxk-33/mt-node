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
      spec_id: {
        type: STRING,
        set(val) {
          this.setDataValue('spec_id', val.join(','));
        },
        get() {
          let specId = this.getDataValue('spec_id');
          if (typeof specId != 'undefined') return specId.split(',')
          return '';
        },
      },
      food_name: STRING,
      picture: STRING,
      num: INTEGER,
      spec_text: {
        type: INTEGER,
        set(val) {
          this.setDataValue('spec_text', val.join(','));
        },
        get() {
          let specText = this.getDataValue('spec_text');
          if (typeof specText != 'undefined') return specText.split(',')
          return '';
        },
      },
      price: FLOAT,
    },
    {
      timestamps: false,
      tableName: 'cartlist',
    }
  );
  CartList.associate = function () {
    CartList.belongsTo(app.model.Shop, {
      foreignKey: 'shop_id',
      targetKey: 'id',
      as: 'shop_info',
    });
  };
  CartList.getList = function (id) {
    return this.findAll({
      where: { user_id: id },
      include: [
        {
          model: app.model.Shop,
          as: 'shop_info',
        },
      ],
    });
  };
  CartList.deleteItem = function (id) {
    return this.destroy({ where: { id } });
  };
  CartList.pushItem = function (data) {
    return this.findOrCreate({
      where: {
        spec_id: data.spec_id.join(','),
        food_id: data.food_id,
        user_id: data.user_id,
      },
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
  CartList.updateNum = function (id, num) {
    return this.update({ num }, { where: { id } });
  };
  CartList.createItem = function (data) {
    return this.create({
      shop_id: data.shop_id,
      food_id: data.food_id,
      user_id: data.user_id,
      spec_id: data.spec_id, // 以逗号分隔的规格id群组
      num: data.num,
      spec_text: data.spec_text,
      price: data.price,
      food_name: data.food_name,
      picture: data.picture,
    });
  };
  return CartList;
};
