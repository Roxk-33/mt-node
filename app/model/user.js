'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const User = app.model.define(
    'user',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      user_name: STRING,
      avatar: STRING,
      tel: STRING,
      account: STRING,
      password: STRING,
      last_login_ip: STRING,
      // 时间戳
      created_at: DATE,
      updated_at: DATE,
    },
    {
      tableName: 'user',
    }
  );

  User.getItemByAccount = function(account) {
    return this.findOne({ where: { account } });
  };
  User.createItem = function(data) {
    return this.create({
      user_name: data.user_name,
      tel: data.tel,
      password: data.password,
      account: data.account,
    });
  };
  User.userIsExist = function(account) {
    return this.findOne({ where: { account } });
  };

  return User;
};
