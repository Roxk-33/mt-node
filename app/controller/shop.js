'use strict';

const Controller = require('egg').Controller;

class ShopController extends Controller {
  get rules() {
    return {
      list: {
        page: { type: 'string', required: false },
      },
      item: {
        id: { type: 'string', required: true },
      },
      create: {
        name: { type: 'string', required: true },
        description: { type: 'string', required: false },
        extends: {
          type: 'array',
          required: false,
          itemType: 'object',
          rule: {
            key: 'string',
            value: 'string',
          },
        },
      },
      update: {
        name: { type: 'string', required: false },
        description: { type: 'string', required: false },
        extends: {
          type: 'array',
          required: false,
          itemType: 'object',
          rule: {
            key: 'string',
            value: 'string',
          },
        },
      },
    };
  }
  async getList() {
    const { ctx, service } = this;

    const { page } = ctx.validateParams(this.rules.list, ctx);
    const data = await service.shop.getShopList(page);
    ctx.body = {
      data: data,
      status: true,
    };
  }
  async getItem() {
    const { ctx, service } = this;
    const { id } = ctx.validateParams(this.rules.item, ctx);

    const data = await service.shop.getShopDetail(id);
    ctx.success(data);
  }
}

module.exports = ShopController;
