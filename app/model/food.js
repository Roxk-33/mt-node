'use strict';

module.exports = app => {
  const { STRING, INTEGER, FLOAT, TEXT, DOUBLE } = app.Sequelize;

  const Food = app.model.define(
    'food',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      shop_id: { type: INTEGER, primaryKey: true },
      food_name: STRING,
      unit: STRING,
      price: FLOAT,
      area_id: FLOAT,
      description: TEXT,
      photo: STRING, //  照片
      month_sale: { type: DOUBLE, allowNull: false, defaultValue: 0 },
      like: { type: FLOAT, allowNull: false, defaultValue: 0 }, //  点赞
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );
  Food.associate = function() {
    Food.belongsTo(app.model.Shop, { foreignKey: 'shop_id', targetKey: 'id' });
  };
  Food.associate = function() {
    Food.hasMany(app.model.FoodSpec, {
      foreignKey: 'food_id',
      sourceKey: 'id',
      as: 'spec_arr',
    });
  };
  return Food;
};