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
      payInfo: {
        id: { type: 'string', required: true },
      },
      list: {
        page: { type: 'string', required: true },
        type: { type: 'string', required: true },
      },
      detail: {
        id: { type: 'string', required: true },
      },
      cancel: {
        id: { type: 'string', required: true },
      },
      review: {},
      confirmOrder: {
        shopId: { type: 'number', required: true },
      },
    };
  }
  async create() {
    const { ctx, service } = this;
    const orderInfo = ctx.validateBody(this.rules.create, ctx);
    const { status, data, msg } = await service.order.orderCreate(
      ctx.mt.id,
      orderInfo
    );
    if (status) ctx.success({ order_info: data }, '提交订单成功');
    else {
      ctx.fail(msg);
    }
  }
  async payOrder() {
    const { ctx, service } = this;
    const { id } = ctx.validateBody(this.rules.pay, ctx);
    const { status, msg } = await service.order.payOrder(id);
    if (status) ctx.success(msg);
    else {
      ctx.fail(msg);
    }
  }
  async getOrderPayInfo() {
    const { ctx, service } = this;
    const { id } = ctx.validateParams(this.rules.payInfo, ctx);
    const result = await service.order.getOrderPayInfo(id);
    if (!!result) ctx.success(result);
    else {
      ctx.fail(msg);
    }
  }
  async list() {
    const { ctx, service } = this;
    const { page, type } = ctx.validateQuery(this.rules.list, ctx);
    const result = await service.order.orderList(ctx.mt.id, page, type);
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
      ctx.fail('获取订单失败');
    }
  }
  async cancel() {
    const { ctx, service } = this;
    const { id } = ctx.validateParams(this.rules.cancel, ctx);
    const { status, msg } = await service.order.cancelOrder(id);
    if (status) ctx.success(msg);
    else {
      ctx.fail(msg);
    }
  }
  async confirmOrder() {
    const { ctx, service } = this;
    const { shopId } = ctx.validateBody(this.rules.confirmOrder, ctx);
    const { id: orderId } = ctx.params;
    console.log(shopId, orderId);
    const { status, msg } = await service.order.confirmOrder(shopId, orderId);
    if (status) ctx.success(msg);
    else {
      ctx.fail(msg);
    }
  }
  async review() {
    const { ctx, service } = this;
    const data = ctx.validateBody(this.rules.review, ctx);
    const { id: orderId } = ctx.params;
    const { status, msg } = await service.order.reviewOrder(
      data,
      ctx.mt.id,
      orderId
    );
    if (status) ctx.success(msg);
    else {
      ctx.fail(msg);
    }
  }
}

module.exports = OrderController;
