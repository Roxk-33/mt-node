'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, BIGINT, UUID } = app.Sequelize;

  const userReview = app.model.define(
    'userReview',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
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
      remarks: TEXT,
      review_food: {
        type: TEXT,
        get() {
          let reviewFood = this.getDataValue('review_food');
          if (reviewFood.length) return JSON.parse(reviewFood);
          return [];
        },
      },
    },
    {
      timezone: '+08:00', //东八时区
      tableName: 'user_reviews',
    }
  );
  userReview.associate = function() {
    userReview.belongsTo(app.model.Shop, {
      foreignKey: 'shop_id',
      sourceKey: 'id',
      as: 'shop_info',
    });
    userReview.belongsTo(app.model.User, {
      foreignKey: 'user_id',
      sourceKey: 'id',
      as: 'user_info',
    });
  };

  userReview.getList = function(id, offset) {
    return this.findAll({
      where: { user_id: id },
      offset,
      limit: 10,
      include: [
        {
          model: app.model.Shop,
          as: 'shop_info',
        },
      ],
    });
  };
  userReview.createReview = function(data, t) {
    return this.create(data, { transaction: t });
  };
  userReview.getItem = function(data) {
    return this.findOne({ where: data });
  };
  userReview.deleteItem = function(id) {
    return this.destroy({ where: { id } });
  };
  userReview.getShopEvalList = function(id, offset) {
    return this.findAll({
      where: { shop_id: id },
      offset,
      limit: 10,
      include: [
        {
          model: app.model.User,
          as: 'user_info',
          attributes: ['user_name', 'avatar'],
        },
      ],
    });
  };
  return userReview;
};
