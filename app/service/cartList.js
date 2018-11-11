'use strict';

const Service = require('egg').Service;

class CartListService extends Service {
  async getCartList(id) {
    return this.app.model.CartList.getList(id);
  }
  async createItem(data) {
    data.spec_id = data.specArr;
    data.spec_text = data.specText;
    data.food_name = data.foodName;
    data.food_id = data.foodId;
    data.price = data.totalPrice;
    data.user_id = data.userId;

    delete data.specArr;
    delete data.totalPrice;
    delete data.foodName;
    // reuslt :[item,created]
    // created 为true时表明购物车中未有该商品并已经insert,false时表明
    // item 为已存在的商品信息
    const result = await this.app.model.CartList.pushItem(data);
    // 若购物车中已有
    if (!result[1]) {
      // 新增
      if (data.num == 1) {
        return this.app.model.CartList.updateNum(result[0].id, ++result[0].num);
      }
      if (data.num == -1 && result[0].num == 1) {
        return this.app.model.CartList.deleteItem(result[0].id);
      } else {
        return this.app.model.CartList.updateNum(result[0].id, --result[0].num);
      }
    }
    return result;
  }
}

module.exports = CartListService;
