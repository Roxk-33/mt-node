'use strict';

const Service = require('egg').Service;

class CartListService extends Service {
  async getCartList() {
    // TODO:用户模块完成后需删除这段代码
    const id = 1;
    return this.app.model.CartList.getList(id);
  }
  async createItem(data) {
    data.spec_id = data.specArr.join(',');
    data.spec_text = data.specText.join(',');
    data.food_name = data.foodName;
    data.food_id = data.foodId;
    data.price = data.totalPrice;
    // TODO:用户模块完成后需删除这段代码
    data.user_id = 1;

    delete data.specArr;
    delete data.totalPrice;
    delete data.foodName;
    // reuslt :[user,created]
    // created 为true时表明购物车中未有该商品并已经insert,false时表明
    // user 为已存在的商品信息
    const result = await this.app.model.CartList.pushItem(data);
    if (!result[1]) {
      return this.app.model.CartList.updateNum(result[0].id, ++result[0].num);
    }
    return result;
  }
}

module.exports = CartListService;
