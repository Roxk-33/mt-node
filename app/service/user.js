'use strict';

const Service = require('egg').Service;
const path = require('path');
const fs = require('fs');
const awaitStreamReady = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');
class UserService extends Service {
  async login(data) {
    const { ctx, app, service } = this;
    let { password, account } = data;
    let result = false;

    const user = await app.model.User.getItemByAccount(account);
    if (!!user) {
      result = ctx.helper.bcompare(password, user.dataValues.password);
      if (result) {
        let token = app.generateToken({ id: user.id });
        // await app.redis.set(user.id, token);
        delete user.password;
        return { token, user };
      }
    }

    return result;
  }
  async register(data) {
    const { ctx, app } = this;
    let { password, account } = data;
    let isExist = await this.isExist(account);
    if (isExist) {
      console.log('已经有这个用户');
      return false;
    }
    password = ctx.helper.mdPassWord(password);
    const { dataValues: user } = await app.model.User.createItem({
      password,
      account,
    });
    let token = app.generateToken({ id: user.id });
    return { token, user };
  }
  async getUserInfo(id) {
    const { app } = this;
    const user = await app.model.User.getItemById(id);
    if (!!user) {
      return user;
    }
    return false;
  }
  updateUserInfo(id, action, data) {
    const { app, ctx } = this;
    let sql = null;
    if (action === 'changeName') {
      sql = { user_name: data };
    }
    if (action === 'changeTel') {
      sql = { tel: data };
    }
    if (action === 'changePsw') {
      data = ctx.helper.mdPassWord(data);
      sql = { password: data };
    }
    return app.model.User.updateItem(sql, id);
  }
  // 检查帐号，帐号是否已存在
  isExist(account) {
    return this.app.model.User.userIsExist(account);
  }

  // 获取评价列表
  getEvalList(userId, page) {
    return this.app.model.UserReview.getList(userId, page * 10);
  }
  // 获取评价列表
  deleteEval(id) {
    return this.app.model.UserReview.deleteItem(id);
  }
  async uploadAvatar() {
    const { app, ctx } = this;

    const stream = await ctx.getFileStream();
    // 生成文件名
    const filename =
      Date.now() +
      '' +
      Number.parseInt(Math.random() * 10000) +
      path.extname(stream.filename);
    // 写入路径
    const target = path.join(
      this.config.baseDir,
      this.config.uploadImgUrl,
      'avatar',
      filename
    );
    const writeStream = fs.createWriteStream(target);
    try {
      // 写入文件
      await awaitStreamReady(stream.pipe(writeStream));
      await app.model.User.updateItem({ avatar: filename }, ctx.mt.id);
      return { status: true, data: filename };
    } catch (err) {
      console.log(err);
      // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
      await sendToWormhole(stream);
      throw '上传失败';
    }
  }
}

module.exports = UserService;
