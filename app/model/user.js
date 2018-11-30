'use strict';
const uuidv1 = require('uuid/v1');

module.exports = app => {
  const { STRING, DATE, UUID } = app.Sequelize;

  const User = app.model.define(
    'user',
    {
      id: {
        type: UUID,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: function() {
          return uuidv1().replace(/-/g, '');
        },
      },
      user_name: {
        type: STRING,
        allowNull: true,
      },
      avatar: {
        type: STRING,
        allowNull: true,
        defaultValue: 'https://i.loli.net/2018/11/14/5bec27346a028.jpg',
      },
      tel: {
        type: STRING,
        allowNull: true,
      },
      account: STRING,
      password: STRING,
      last_login_ip: STRING,
      // 时间戳
      created_at: DATE,
      updated_at: DATE,
    },
    {
      timezone: '+08:00', //东八时区
      tableName: 'user',
    }
  );

  User.getItemByAccount = function(account) {
    return this.findOne({
      where: { account },
      // attributes: { exclude: ['password'] }
    });
  };
  User.getItem = function(sql) {
    return this.findOne({
      where: sql,
      attributes: ['id', 'user_name', 'avatar', 'tel', 'account'],
    });
  };
  User.createItem = function(data) {
    return this.create({
      password: data.password,
      account: data.account,
      user_name: data.account,
    });
  };
  User.updateItem = function(sql, id) {
    return this.update(sql, { where: { id } });
  };
  User.userIsExist = function(account) {
    return this.findOne({ where: { account } });
  };

  return User;
};
