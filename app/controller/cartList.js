'use strict';

const Controller = require('egg').Controller;

class cartListController extends Controller {
  get rules() {
    return {
      list: {
        userId: { type: 'string', required: true },
      },
    };
  }
  async getList() {
    const { ctx, service } = this;
    const { userId } = ctx.validateParams(this.rules.list, ctx);
    const result = await service.cartList.getCartList(userId);
    if (!!result) {
      ctx.success(result);
    } else {
      ctx.fail();
    }
  }
  async updateItem() {}
  async create() {
    const { ctx, service } = this;
    const data = ctx.request.body;
    const result = await service.cartList.createItem(data);
    if (!!result) {
      ctx.success();
    } else {
      ctx.fail();
    }
  }
}

module.exports = cartListController;
