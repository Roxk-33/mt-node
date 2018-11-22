'use strict';

const Controller = require('egg').Controller;

class cartListController extends Controller {
  get rules() {
    return {
      list: {},
      listByShop: {
        shopId: { type: 'string', required: true },
      },
      empty: {
        shopId: { type: 'string', required: true },
      },
    };
  }
  async getList() {
    const { ctx, service } = this;
    const result = await service.cartList.getCartList(ctx.mt.id);
    if (!!result) {
      ctx.success(result);
    } else {
      ctx.fail();
    }
  }
  async getListByShop() {
    const { ctx, service } = this;
    const { shopId } = ctx.validateParams(this.rules.listByShop, ctx);
    const result = await service.cartList.getCartListByShop(ctx.mt.id, shopId);
    if (!!result) {
      ctx.success(result);
    } else {
      ctx.fail();
    }
  }
  async updateItem() {
    const { ctx, service } = this;
    const { id, type } = ctx.request.body;
    const result = await service.cartList.updateItem(id, type);
    if (!!result) {
      ctx.success();
    } else {
      ctx.fail();
    }
  }
  async create() {
    const { ctx, service } = this;
    const data = ctx.request.body;
    const result = await service.cartList.createItem(data);
    if (!!result) {
      ctx.success(result);
    } else {
      ctx.fail();
    }
  }
  async empty() {
    const { ctx, service } = this;
    const { shopId } = ctx.validateParams(this.rules.empty, ctx);
    const result = await service.cartList.deleteItem(shopId);
    if (!!result) {
      ctx.success(result);
    } else {
      ctx.fail();
    }
  }
}

module.exports = cartListController;
