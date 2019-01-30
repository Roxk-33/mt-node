'use strict';

const Service = require('egg').Service;
const path = require('path');
const fs = require('fs');
const awaitStreamReady = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');
class MerchantService extends Service {
  async login(data) {
    const { ctx, app, service } = this;
    let { password, account } = data;
    let result = false;

    const merchant = await app.model.Merchant.getItemByAccount(account);
    if (!!merchant) {
      result = ctx.helper.bcompare(password, merchant.dataValues.password);
      if (result) {
        let token = app.generateToken({ id: merchant.id });
        // await app.redis.get('merchant').set(merchant.id, token);
        // await app.redis.get('merchant').expire(merchant.id, expireTime);

        delete merchant.password;
        return { token, merchant };
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
    const { dataValues: merchant } = await app.model.Merchant.createItem({
      password,
      account,
    });
    let token = app.generateToken({ id: merchant.id });
    return { token, merchant };
  }
  async getMerchantInfo(id) {
    const { app } = this;
    const merchant = await app.model.Merchant.getItem({ id });
    if (!!merchant) {
      return merchant;
    }
    return false;
  }

  // 检查帐号，帐号是否已存在
  isExist(account) {
    return this.app.model.Merchant.userIsExist(account);
  }

  async uploadShopAvatar() {
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
      await app.model.Merchant.updateItem({ avatar: filename }, ctx.mt.id);
      return { status: true, data: filename };
    } catch (err) {
      console.log(err);
      // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
      await sendToWormhole(stream);
      throw err;
    }
  }
}

module.exports = UserService;
