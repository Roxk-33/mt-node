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
      spec_arr: {
        type: STRING,
        set(val) {
          if (val.length === 0) this.setDataValue('spec_arr', '');
          else this.setDataValue('spec_arr', val.join(','));
        },
        get() {
          let specId = this.getDataValue('spec_arr');
          if (specId && specId.length) return specId.split(',');
          return [];
        },
      },
      food_name: STRING,
      picture: STRING,
      num: {
        type: INTEGER,
        defaultValue: 1,
      },
      spec_text: {
        type: INTEGER,
        set(val) {
          if (val.length === 0) this.setDataValue('spec_text', '');
          else this.setDataValue('spec_text', val.join(','));
        },
        get() {
          let specText = this.getDataValue('spec_text');
          if (specText && specText.length) return specText.split(',');
          return [];
        },
      },
      price: FLOAT,
    },
    {
      timestamps: false,
      tableName: 'cartlist',
    }
  );
  CartList.associate = function() {
    CartList.belongsTo(app.model.Shop, {
      foreignKey: 'shop_id',
      targetKey: 'id',
      as: 'shop_info',
    });
  };
  CartList.getList = function(search) {
    return this.findAll({
      where: search,
      include: [
        {
          model: app.model.Shop,
          as: 'shop_info',
        },
      ],
    });
  };
  CartList.deleteItem = function(data, t = null) {
    if (!!t) {
      return this.destroy({ where: data, transaction: t });
    } else {
      return this.destroy({ where: data });
    }
  };

  CartList.getItem = function(id) {
    return this.findOne({ where: { id } });
  };
  CartList.pushItem = function(data) {
    return this.create({
      defaults: {
        shop_id: data.shop_id,
        food_id: data.food_id,
        user_id: data.user_id,
        spec_arr: data.spec_arr, // 以逗号分隔的规格id群组
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
      food_id: data.foodId,
      user_id: data.userId,
      spec_arr: data.specArr, // 以逗号分隔的规格id群组
      num: data.num,
      spec_text: data.specText,
      price: data.totalPrice,
      food_name: data.foodName,
      picture: data.picture,
    });
  };
  return CartList;
};
