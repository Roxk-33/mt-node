'use strict';

module.exports = app => {
  const { STRING, INTEGER, FLOAT, TEXT, DOUBLE } = app.Sequelize;

  const Food = app.model.define(
    'food',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      shop_id: { type: INTEGER, primaryKey: true },
      stock: { type: INTEGER, defaultValue: 10 },
      food_name: STRING,
      unit: STRING,
      price: FLOAT,
      area_id: FLOAT,
      description: TEXT,
      picture: {
        type: STRING,
        defaultValue: 'https://via.placeholder.com/100x100',
      }, //  照片
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
  Food.updateStock = function(id, stock, t) {
    return this.update(
      { stock: stock },
      { where: { id: id } },
      { transaction: t }
    );
  };
  Food.getItem = function(id) {
    return this.findOne({
      where: { id },
      include: [
        {
          model: app.model.FoodSpec,
          as: 'spec_arr',
        },
      ],
    });
  };
  return Food;
};
