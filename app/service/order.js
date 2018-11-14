'use strict';

const Service = require('egg').Service;

class OrderService extends Service {
  async orderPay(userId, data) {
    const { ctx, service } = this;
    // 获取购物车信息
    const { shopId, address, remarks } = data;
    const cartList = await service.cartList.getCartListByShop(userId, shopId);
    const shopInfo = cartList[0].shop_info;
    const totalPrice = cartList.reduce((previous, current) => previous += current.num * current.price, shopInfo.freight)
    // 创建订单
    let transaction;
    try {
      transaction = await this.ctx.model.transaction();

      const { dataValues: orderInfo } = await this.app.model.Order.createOrder({
        user_id: userId,
        shop_id: shopId,
        remarks: remarks,
        address: address.address,
        total_price: totalPrice,
        freight: shopInfo.freight,
        tel: address.tel,
        user_name: address.user_name,
        user_sex: address.user_sex,
      }, transaction);
      const len = cartList.length;
      for (let index = 0; index < len; index++) {
        const foodInfo = cartList[index];
        await this.app.model.Order.createOrderFood({
          user_id: userId,
          order_id: orderInfo.id,
          food_id: foodInfo.food_id,
          spec_text: foodInfo.spec_text,
          price: foodInfo.price,
          num: foodInfo.num,
          food_picture: foodInfo.picture,
          food_name: foodInfo.food_name,
        }, transaction);
        await this.app.model.CartList.deleteItem(foodInfo.id, transaction);
        if (index === len - 1) {
          await transaction.commit();
        }
      }

      console.log(111);
    } catch (e) {
      console.log('出错');
      console.log(e);
      await transaction.rollback();
      return false;
    }

    return true;

  }
}

module.exports = OrderService;
