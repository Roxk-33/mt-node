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
        // await app.redis.get('user').set(user.id, token);
        // await app.redis.get('user').expire(user.id, expireTime);

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
    const user = await app.model.User.getItem({ id });
    if (!!user) {
      return user;
    }
    return false;
  }
  async updateUserInfo(id, data) {
    const { app, ctx } = this;
    let { action, psw, userName, tel, code } = data;
    let sql = null;
    if (action === 'changeName') {
      sql = { user_name: userName };
    }
    if (action === 'changeTel') {
      let verCode = await app.redis.get('user').get(id);
      if (verCode !== code) {
        return { status: false, msg: '验证码错误' };
      }
      sql = { tel: tel };
    }
    if (action === 'changePsw') {
      psw = ctx.helper.mdPassWord(psw);
      sql = { password: psw };
    }
    await app.model.User.updateItem(sql, id);
    return { status: true, msg: '修改成功' };
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
  // 获取验证码
  async getVercode(phone) {
    const { app, ctx } = this;
    const userId = ctx.mt.id;
    const expireTime = app.config.verCodeTime;
    const userRedis = await app.redis.get('user');

    const isExist = await app.model.User.getItem({ tel: phone });

    const code = Math.floor(Math.random() * 8999 + 1000) + 1;
    if (!isExist) {
      // 生成验证码
      await userRedis.set(userId, code);
      await userRedis.expire(userId, expireTime);
      return { status: true, msg: '验证码已发送', data: code };
    }
    return { status: false, msg: '已存在该手机号' };
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
