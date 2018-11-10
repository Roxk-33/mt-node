'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  get rules() {
    return {
      create: {
        password: {
          type: 'password',
          required: true,
          allowEmpty: false,
          min: 6,
        },
        account: { type: 'string', required: true },
        user_name: { type: 'string', required: true },
        tel: { type: 'string', required: false },
      },
      item: {
        password: {
          type: 'password',
          required: true,
          allowEmpty: false,
          min: 6,
        },
        account: { type: 'string', required: true },
      },
    };
  }
  async addAddress() {
    const { ctx, service } = this;
    const address = ctx.request.body;
    await service.user.addAddress(address);
    ctx.body = {
      success: true,
    };
  }
  async login() {
    const { ctx, service } = this;
    const data = ctx.validateBody(this.rules.item, ctx);
    const result = await service.user.login(data);
    if (!!result) ctx.success(result);
    else {
      ctx.fail('帐号或密码不存在');
    }
  }
  async getInfo() {
    const { ctx, service } = this;
    const result = await service.user.getUserInfo(ctx.mt.id);
    if (!!result) ctx.success(result);
    else {
      ctx.fail('不存在该帐号');
    }
  }
  async register() {
    const { ctx, service } = this;
    const data = ctx.validateBody(this.rules.create, ctx);
    const result = await service.user.register(data);
    if (!!result) ctx.success('注册成功');
    else {
      ctx.fail('帐号已存在');
    }
  }
}

module.exports = UserController;
