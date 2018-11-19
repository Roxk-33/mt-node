'use strict';

const Service = require('egg').Service;

class OrderService extends Service {
  async orderCreate(userId, data) {
    const { service } = this;
    // 获取购物车信息
    const { shopId, address, remarks, cartIdArr, arrivalTime } = data;
    const cartList = await service.cartList.getCartListByShop(userId, shopId);
    const shopInfo = cartList[0].shop_info;

    const totalPrice = cartList.reduce(
      (previous, current) => (previous += current.num * current.price),
      shopInfo.freight
    );
    // 创建订单
    let transaction;
    try {
      transaction = await this.ctx.model.transaction();

      const { dataValues: orderInfo } = await this.app.model.Order.createOrder(
        {
          user_id: userId,
          shop_id: shopId,
          remarks: remarks,
          address: address.address,
          total_price: totalPrice,
          freight: shopInfo.freight,
          tel: address.tel,
          user_name: address.user_name,
          user_sex: address.user_sex,
          arrival_time: arrivalTime,
        },
        transaction
      );
      const len = cartList.length;
      for (let index = 0; index < len; index++) {
        const foodInfo = cartList[index];
        // 不在所选商品中
        if (cartIdArr.length && cartIdArr.indexOf(foodInfo.id) === -1) continue;

        const result = await service.shop.detectStock(foodInfo);
        // 无库存
        if (!result.status) {
          throw foodInfo;
        }
        await this.app.model.Order.createOrderFood(
          {
            user_id: userId,
            order_id: orderInfo.id,
            food_id: foodInfo.food_id,
            spec_text: foodInfo.spec_text,
            price: foodInfo.price,
            num: foodInfo.num,
            food_picture: foodInfo.picture,
            food_name: foodInfo.food_name,
          },
          transaction
        );
        await this.app.model.CartList.deleteItem(foodInfo.id, transaction);
        // 规格类产品库存放在规格表
        if (foodInfo.spec_arr.length) {
          for (let index = 0; index < foodInfo.spec_arr.length; index++) {
            const specId = foodInfo.spec_arr[index];
            await this.app.model.FoodSpec.updateStock(
              specId,
              result.stock[index],
              transaction
            );
          }
        } else {
          await this.app.model.Food.updateStock(
            foodInfo.food_id,
            result.stock,
            transaction
          );
        }
        if (index === len - 1) {
          await transaction.commit();
        }
      }
      return { status: true, data: orderInfo.id };
    } catch (e) {
      console.log('出错');
      console.log(e);
      await transaction.rollback();
      let result = { status: false, msg: '系统出错' };
      if (!!e.food_name) {
        if (e.spec_arr.length) {
          result.msg = `${e.food_name}(${e.spec_text})库存不足`;
        } else {
          result.msg = `${e.food_name}库存不足`;
        }
      }
      return result;
    }
  }
  orderList(userId, page) {
    return this.app.model.Order.getList(userId, page * 10);
  }
  orderDetail(id) {
    return this.app.model.Order.getDetail(id);
  }
  cancelOrder(id) {
    return this.app.model.Order.chagneOrderStatus(6, id);
  }
}

module.exports = OrderService;
