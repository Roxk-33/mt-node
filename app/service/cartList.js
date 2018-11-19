'use strict';

const Service = require('egg').Service;

class CartListService extends Service {
  async getCartList(id) {
    return this.app.model.CartList.getList({ user_id: id });
  }
  async getCartListByShop(userId, shopId) {
    return this.app.model.CartList.getList({
      user_id: userId,
      shop_id: shopId,
    });
  }
  async updateItem(id, type) {
    const foodInfo = await this.app.model.CartList.getItem(id);
    if (type == 1) {
      return this.app.model.CartList.updateNum(id, ++foodInfo.num);
    }
    // 判断该商品数量是否为1，若为1则直接删除
    if (foodInfo.num === 1) {
      return this.app.model.CartList.deleteItem(foodInfo.id);
    } else {
      return this.app.model.CartList.updateNum(foodInfo.id, --foodInfo.num);
    }
  }
  async createItem(data) {
    const result = await this.app.model.CartList.createItem(data);
    return result;
  }
}

module.exports = CartListService;
