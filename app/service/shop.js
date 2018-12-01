'use strict';

const Service = require('egg').Service;

class ShopService extends Service {
  getShopList() {
    return this.app.model.Shop.getList();
  }
  getShopDetail(id) {
    return this.app.model.Shop.getDetail(id);
  }
  // 检测商品是否有库存
  async detectStock(cartFoodInfo) {
    let result = {
      status: false,
      stock: null,
    };

    const foodInfo = await this.app.model.Food.getItem(cartFoodInfo.food_id);
    // 该商品是规格商品
    if (cartFoodInfo.spec_arr.length) {
      result.stock = [];
      result.status = !cartFoodInfo.spec_arr.some(item => {
        let index = foodInfo.spec_arr.findIndex(_item => _item.id == item);
        // 商品库存
        let stock = foodInfo.spec_arr[index].stock;
        // 购买数量大于库存
        if (stock < cartFoodInfo.num) return true;
        result.stock.push(stock - cartFoodInfo.num);
        return false;
      });
    } else if (foodInfo.stock >= cartFoodInfo.num) {
      result.status = true;
      result.stock = foodInfo.stock - cartFoodInfo.num;
    }
    return result;
  }
  getShopEvalList(id, page) {
    return this.app.model.UserReview.getShopEvalList(id, page * 10);
  }
}

module.exports = ShopService;
