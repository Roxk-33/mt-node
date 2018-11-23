'use strict';

const Controller = require('egg').Controller;

class OrderController extends Controller {
  get rules() {
    return {
      create: {
        shopId: { type: 'number', required: true },
      },
      pay: {
        id: { type: 'number', required: true },
      },
      list: {
        page: { type: 'string', required: true },
      },
      detail: {
        id: { type: 'string', required: true },
      },
      cancel: {
        id: { type: 'string', required: true },
      },
    };
  }
  async orderCreate() {
    const { ctx, service } = this;
    const data = ctx.validateBody(this.rules.create, ctx);
    const result = await service.order.orderCreate(ctx.mt.id, data);
    if (result.status) ctx.success({ order_info: result.data }, '提交订单成功');
    else {
      ctx.fail(result.msg);
    }
  }
  async orderPay() {
    const { ctx, service } = this;
    const { id } = ctx.validateBody(this.rules.pay, ctx);
    const result = await service.order.orderPay(id);
    if (result) ctx.success({ order_info: result.data }, '支付订单成功');
    else {
      ctx.fail(result.msg);
    }
  }
  async list() {
    const { ctx, service } = this;
    const { page } = ctx.validateQuery(this.rules.list, ctx);
    const result = await service.order.orderList(ctx.mt.id, page);
    if (!!result) ctx.success(result);
    else {
      ctx.fail();
    }
  }
  async detail() {
    const { ctx, service } = this;
    const { id } = ctx.validateParams(this.rules.detail, ctx);
    const result = await service.order.orderDetail(id);
    if (!!result) ctx.success(result);
    else {
      ctx.fail();
    }
  }
  async cancel() {
    const { ctx, service } = this;
    const { id } = ctx.validateParams(this.rules.cancel, ctx);
    const result = await service.order.cancelOrder(id);
    if (!!result) ctx.success(result);
    else {
      ctx.fail();
    }
  }
}

module.exports = OrderController;
