'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const Merchant = app.model.define(
    'merchant',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      account: STRING,
      password: STRING,
      user_name: {
        type: STRING,
        allowNull: true,
      },
      last_login_ip: STRING,
      // 时间戳
      created_at: DATE,
      updated_at: DATE,
      shop_id: INTEGER,
    },
    {
      timezone: '+08:00', //东八时区
      freezeTableName: true,
    }
  );
  Merchant.associate = function() {
    this.belongsTo(app.model.Shop, { foreignKey: 'shop_id', targetKey: 'id' });
    // this.hasMany(app.model.FoodSpec, {
    //   foreignKey: 'food_id',
    //   sourceKey: 'id',
    //   as: 'spec_arr',
    // });
  };
  Merchant.createItem = function(data) {
    return this.create({
      password: data.password,
      account: data.account,
      user_name: data.account,
    });
  };
  Merchant.userIsExist = function(account) {
    return this.findOne({ where: { account } });
  };
  Merchant.getItem = function(sql) {
    return this.findOne({
      where: sql,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: app.model.FoodSpec,
          as: 'spec_arr',
        },
      ],
    });
  };

  return Merchant;
};
