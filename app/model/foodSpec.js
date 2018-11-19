'use strict';

module.exports = app => {
  const { STRING, INTEGER, FLOAT } = app.Sequelize;

  const FoodSpec = app.model.define(
    'foodSpec',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      food_id: { type: INTEGER, primaryKey: true },
      spec_type: { type: INTEGER, primaryKey: true },
      spec_type: { type: INTEGER, primaryKey: true },
      label: STRING,
      spec_name: STRING,
      price: FLOAT,
      stock: INTEGER,
      is_default: INTEGER,
    },
    {
      timestamps: false,
      tableName: 'food_spec',
    }
  );
  FoodSpec.associate = function() {
    FoodSpec.belongsTo(app.model.Food, {
      foreignKey: 'food_id',
      targetKey: 'id',
    });
  };
  FoodSpec.updateStock = function(id, stock, t) {
    return this.update(
      { stock: stock },
      { where: { id: id } },
      { transaction: t }
    );
  };
  return FoodSpec;
};
