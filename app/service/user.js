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
        return token;
      }
    }

    return result;
  }
  async register(data) {
    const { ctx, app } = this;
    let { password, account, user_name, tel } = data;
    let isExist = await this.isExist(account);
    if (isExist) {
      console.log('已经有这个用户');
      return false;
    }

    password = ctx.helper.mdPassWord(password);
    return app.model.User.createItem({ password, account, user_name, tel });
  }
  userInfo() {}
  // 检查帐号，手机号是否已存在
  isExist(account) {
    return this.app.model.User.userIsExist(account);
  }
}

module.exports = UserService;
