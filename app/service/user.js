'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  async login(data) {
    const { ctx, app, service } = this;
    let { password, account } = data;
    let result = false;

    const user = await app.model.User.getItemByAccount(account);
    if (!!user) {
      result = ctx.helper.bcompare(password, user.dataValues.password);
      if (result) {
        let token = app.generateToken({ id: user.id });
        await app.redis.set(user.id, token);
        delete user.password;
        return { token, user };
      }
    }

    return result;
  }
  async register(data) {
    const { ctx, app } = this;
    let { password, account } = data;
    let isExist = await this.isExist(account);
    if (isExist) {
      console.log('已经有这个用户');
      return false;
    }
    password = ctx.helper.mdPassWord(password);
    const { dataValues: user } = await app.model.User.createItem({
      password,
      account,
    });
    let token = app.generateToken({ id: user.id });
    return { token, user };
  }
  async getUserInfo(id) {
    const { app } = this;
    const user = await app.model.User.getItemById(id);
    if (!!user) {
      return user;
    }
    return false;
  }
  updateUserInfo(id, action, data) {
    const { app, ctx } = this;
    let sql = null;
    if (action === 'changeName') {
      sql = { user_name: data };
    }
    if (action === 'changeTel') {
      sql = { tel: data };
    }
    if (action === 'changePsw') {
      data = ctx.helper.mdPassWord(data);
      sql = { password: data };
    }
    return app.model.User.updateItem(sql, id);
  }
  // 检查帐号，帐号是否已存在
  isExist(account) {
    return this.app.model.User.userIsExist(account);
  }
}

module.exports = UserService;
