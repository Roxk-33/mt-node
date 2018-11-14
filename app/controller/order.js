'use strict';

const Controller = require('egg').Controller;

class OrderController extends Controller {
  get rules() {
    return {
      pay: {
        shopId: { type: 'number', required: true }
      }
    }
  }
  async orderPay() {
    const { ctx, service } = this;
    const data = ctx.validateBody(this.rules.pay, ctx);
    const result = await service.order.orderPay(ctx.mt.id, data);
    if (!!result) ctx.success('提交订单成功');
    else {
      ctx.fail();
    }
  }
}

module.exports = OrderController;
