'use strict';

module.exports = app => {
  const { INTEGER } = app.Sequelize;

  const shopSale = app.model.define(
    'shopSale',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      shop_id: INTEGER,
      sale: {
        type: INTEGER,
        defaultValue: 1,
      },
    },
    {
      timezone: '+08:00', //东八时区
      tableName: 'shop_sale',
    }
  );
  shopSale.associate = function() {
    shopSale.belongsTo(app.model.Shop, {
      foreignKey: 'shop_id',
      targetKey: 'id',
    });
  };
  shopSale.getItem = function(id) {
    console.log('id:' + id);
    return this.findOne({ where: { shop_id: id } });
  };
  shopSale.createItem = function(data) {
    return this.create(data);
  };
  shopSale.updateItem = function(sale, id) {
    return this.update({ sale }, { where: { id: id } });
  };
  return shopSale;
};
