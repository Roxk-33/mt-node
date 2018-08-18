'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async addAddress() {
    const { ctx, service } = this;
    const address = ctx.request.body;
    await service.user.addAddress(address);
    ctx.body = {
      success: true,
    };
  }
  login() {
    const { ctx, service } = this;
    const address = ctx.request.body;
    console.log(address);
    ctx.body = {
      success: true,
    };
  }
}

module.exports = UserController;
