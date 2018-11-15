'use strict';

module.exports = app => {
  const { STRING, INTEGER, FLOAT, TEXT } = app.Sequelize;

  const orderItem = app.model.define(
    'orderItem',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: STRING },
      food_id: { type: INTEGER, primaryKey: true },
      user_id: { type: INTEGER, allowNull: false },
      spec_text: {
        type: INTEGER,
        set(val) {
          if (val.length === 0) this.setDataValue('spec_text', '');
          else this.setDataValue('spec_text', val.join(','));
        },
        get() {
          let specText = this.getDataValue('spec_text');
          if (specText.length) return specText.split(',');
          return [];
        },
      },
      food_picture: STRING,
      food_name: STRING,
      num: INTEGER,
      price: FLOAT,
    },
    {
      timestamps: false,
      tableName: 'order_item',
    }
  );
  const orderList = app.model.define(
    'orderList',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: INTEGER, primaryKey: true },
      shop_id: { type: INTEGER, allowNull: false },
      user_sex: { type: INTEGER, allowNull: false },
      address: { type: STRING, allowNull: false },
      remarks: { type: TEXT, allowNull: true },
      total_price: FLOAT,
      tel: STRING,
      user_name: STRING,
      // 订单状态
      // 0：未支付；1：已支付；2：送达中；3：已送达；4：退款中
      status: { type: INTEGER, defaultValue: 0 },
      freight: FLOAT,
    },
    {
      tableName: 'order_list',
    }
  );

  orderList.associate = function() {
    orderList.hasMany(orderItem, {
      foreignKey: 'order_id',
      sourceKey: 'id',
      as: 'food_list',
    });
    orderList.belongsTo(app.model.Shop, {
      foreignKey: 'shop_id',
      targetKey: 'id',
      as: 'shop_info',
    });
  };
  orderItem.associate = function() {
    orderItem.belongsTo(orderList, {
      foreignKey: 'order_id',
      targetKey: 'id',
    });
  };
  orderList.createOrder = function(data, t) {
    return this.create(data, { transaction: t });
  };
  orderList.getList = function(user_id, offset) {
    return this.findAll({
      where: { user_id },
      offset,
      limit: 10,
      include: [
        {
          model: app.model.Shop,
          as: 'shop_info',
        },
        {
          model: orderItem,
          as: 'food_list',
        },
      ],
    });
  };
  orderList.createOrderFood = function(data, t) {
    return orderItem.create(data, { transaction: t });
  };
  orderList.getDetail = function(id) {
    return this.findOne({
      where: { id },
      include: [
        {
          model: app.model.Shop,
          as: 'shop_info',
        },
        {
          model: orderItem,
          as: 'food_list',
        },
      ],
    });
  };
  return orderList;
};
