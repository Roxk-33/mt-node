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
      tableName: 'user',
    }
  );

  User.getItemByAccount = function(account) {
    return this.findOne({
      where: { account },
    });
  };
  User.getItemById = function(id) {
    return this.findOne({
      where: { id },
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
