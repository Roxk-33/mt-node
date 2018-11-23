'use strict';

const Service = require('egg').Service;

class OrderService extends Service {
  async orderCreate(userId, data) {
    const { service, app } = this;
    // 获取购物车信息
    const {
      shopId,
      address,
      remarks,
      cartIdArr,
      arrivalTime,
      tableware,
    } = data;
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
      const dead_line_time = new Date();

      dead_line_time.setSeconds(
        dead_line_time.getSeconds() + this.app.config.pay.deadline
      );
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
          deadline_pay_time: dead_line_time,
          tableware_num: tableware,
        },
        transaction
      );
      const len = cartList.length;
      for (let index = 0; index < len; index++) {
        const cartFoodInfo = cartList[index];
        // 不在所选商品中
        if (cartIdArr.length && cartIdArr.indexOf(cartFoodInfo.id) === -1)
          continue;

        const result = await service.shop.detectStock(cartFoodInfo);
        // 无库存
        if (!result.status) {
          throw cartFoodInfo;
        }
        await this.app.model.Order.createOrderFood(
          {
            user_id: userId,
            order_id: orderInfo.id,
            food_id: cartFoodInfo.food_id,
            spec_text: cartFoodInfo.spec_text,
            price: cartFoodInfo.price,
            num: cartFoodInfo.num,
            food_picture: cartFoodInfo.picture,
            food_name: cartFoodInfo.food_name,
          },
          transaction
        );
        await this.app.model.CartList.deleteItem(
          { id: cartFoodInfo.id },
          transaction
        );
        // 规格类产品库存放在规格表
        if (cartFoodInfo.spec_arr.length) {
          for (let index = 0; index < cartFoodInfo.spec_arr.length; index++) {
            const specId = cartFoodInfo.spec_arr[index];
            await this.app.model.FoodSpec.updateStock(
              specId,
              result.stock[index],
              transaction
            );
          }
        } else {
          await this.app.model.Food.updateStock(
            cartFoodInfo.food_id,
            result.stock,
            transaction
          );
        }
        if (index === len - 1) {
          await transaction.commit();
        }
      }
      this.setSchedules(orderInfo.id, dead_line_time);
      return { status: true, data: orderInfo };
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
  async orderDetail(id) {
    let i = await this.app.redis.get('user').get('ss');
    console.log(i);
    return this.app.model.Order.getDetail(id);
  }
  orderPay(id) {
    const orderStatus = 'PAY';
    return this.app.model.Order.chagneOrderStatus(orderStatus, id);
  }
  cancelOrder(id) {
    let orderStatus = 'ORDER_CANCEL';
    return this.app.model.Order.chagneOrderStatus(orderStatus, id);
  }
  async setSchedules(id, timeEnd) {
    const { app } = this;
    await app.redis.get('order').set(id, 1);
    const time = app.getResidualTime();
    await app.redis.get('order').expire(id, timeEnd);
  }
}

module.exports = OrderService;
