'use strict';

const Controller = require('egg').Controller;

class cartListController extends Controller {
  async getList() {
    const { ctx, service } = this;
    const result = await service.cartList.getCartList();
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
