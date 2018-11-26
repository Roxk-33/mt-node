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

      updateUser: {
        action: {
          type: 'string',
          required: true,
        },
      },
      address: {
        address: {
          type: 'string',
          required: true,
        },
        tel: { type: 'string', required: true },
      },
      delete: {
        id: {
          type: 'string',
          required: true,
        },
      },
      addressItem: {
        id: {
          type: 'string',
          required: true,
        },
      },
      evalList: {
        page: {
          type: 'string',
          required: true,
        },
      },
      deleteEval: {
        id: {
          type: 'string',
          required: true,
        },
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
  async getInfo() {
    const { ctx, service } = this;
    const result = await service.user.getUserInfo(ctx.mt.id);
    if (!!result) ctx.success(result);
    else {
      ctx.fail('不存在该帐号');
    }
  }
  async updateInfo() {
    const { ctx, service } = this;
    const { action, data } = ctx.validateBody(this.rules.updateUser, ctx);

    const result = await service.user.updateUserInfo(ctx.mt.id, action, data);
    if (!!result) ctx.success('修改成功');
    else {
      ctx.fail('修改失败');
    }
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
  async addressList() {
    const { ctx, service } = this;
    const result = await service.userAddress.getAddressList(ctx.mt.id);
    if (!!result) ctx.success(result);
    else {
      ctx.fail();
    }
  }
  async address() {
    const { ctx, service } = this;
    const { id } = ctx.validateParams(this.rules.addressItem, ctx);
    const result = await service.userAddress.getAddressInfo(id);
    if (!!result) ctx.success(result);
    else {
      ctx.fail();
    }
  }
  async addAddress() {
    const { ctx, service } = this;
    const data = ctx.validateBody(this.rules.address, ctx);
    const result = await service.userAddress.createAddress(ctx.mt.id, data);
    if (!!result) ctx.success('添加成功');
    else {
      ctx.fail();
    }
  }
  async editAddress() {
    const { ctx, service } = this;
    const data = ctx.validateBody(this.rules.address, ctx);
    const result = await service.userAddress.updataAddress(data);
    if (!!result) ctx.success('修改成功');
    else {
      ctx.fail();
    }
  }
  async delAddress() {
    const { ctx, service } = this;
    const { id } = ctx.validateParams(this.rules.delete, ctx);
    const result = await service.userAddress.delAddress(id);
    if (!!result) ctx.success('删除成功');
    else {
      ctx.fail();
    }
  }
  async evalList() {
    const { ctx, service } = this;
    const { page } = ctx.validateQuery(this.rules.evalList, ctx);
    const result = await service.user.getEvalList(ctx.mt.id, page);
    if (!!result) ctx.success(result);
    else {
      ctx.fail();
    }
  }
  async deleteEval() {
    const { ctx, service } = this;
    const { id } = ctx.validateParams(this.rules.deleteEval, ctx);
    const result = await service.user.deleteEval(id);
    if (!!result) ctx.success(result);
    else {
      ctx.fail();
    }
  }
}

module.exports = UserController;
