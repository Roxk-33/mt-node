'use strict';

const Controller = require('egg').Controller;

class MerchantController extends Controller {
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

  async login() {
    const { ctx, service } = this;
    const data = ctx.validateBody(this.rules.item, ctx);
    const result = await service.user.login(data);
    if (!!result) ctx.success(result);
    else {
      ctx.fail('帐号或密码不存在');
    }
  }
  async logout() {
    const { ctx } = this;
    ctx.success('登出成功');
  }
  async register() {
    const { ctx, service } = this;
    const data = ctx.validateBody(this.rules.create, ctx);
    const result = await service.user.register(data);
    if (!!result) ctx.success(result);
    else {
      ctx.fail('帐号已存在');
    }
  }
  // 获取用户信息
  async getUserInfo() {
    const { ctx, service } = this;
    const result = await service.user.getUserInfo(ctx.mt.id);
    if (!!result) ctx.success(result);
    else {
      ctx.fail('不存在该帐号');
    }
  }

  // 更换用户头像
  async uploadShopAvatar() {
    const { ctx, service } = this;
    const { status, data } = await service.user.uploadShopAvatar();
    if (status) {
      ctx.success({ url: data }, '上传成功');
    } else {
      ctx.fail('修改失败');
    }
  }
}

module.exports = MerchantController;
