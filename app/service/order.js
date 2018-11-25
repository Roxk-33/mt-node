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
    let _arrivalTime = new Date(arrivalTime);
    const totalPrice = cartList.reduce(
      (previous, current) => (previous += current.num * current.price),
      shopInfo.freight
    );
    // 创建订单
    let transaction;
    try {
      transaction = await app.model.transaction();
      const dead_line_time = new Date();

      dead_line_time.setSeconds(
        dead_line_time.getSeconds() + app.config.pay.deadline
      );
      const { dataValues: orderInfo } = await app.model.OrderList.createOrder(
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
          tableware_num: tableware,
        },
        transaction
      );
      const {
        dataValues: orderStatus,
      } = await app.model.OrderStatusTime.createStatus(
        {
          order_id: orderInfo.id,
          created_time: orderInfo.created_at,
          deadline_pay_time: dead_line_time,
          arrival_time: _arrivalTime,
        },
        transaction
      );
      orderInfo.order_status = orderStatus;
      const len = cartList.length;
      for (let index = 0; index < len; index++) {
        const cartFoodInfo = cartList[index];
        // 不在所选商品中
        if (cartIdArr.length && cartIdArr.indexOf(cartFoodInfo.id) === -1)
          continue;
        const { status, stock } = await service.shop.detectStock(cartFoodInfo);
        // 无库存
        if (!status) {
          throw cartFoodInfo;
        }
        await app.model.OrderList.createOrderFood(
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

        await app.model.CartList.deleteItem(
          { id: cartFoodInfo.id },
          transaction
        );
        // 规格类产品库存放在规格表
        if (cartFoodInfo.spec_arr.length) {
          for (let index = 0; index < cartFoodInfo.spec_arr.length; index++) {
            const specId = cartFoodInfo.spec_arr[index];
            await app.model.FoodSpec.updateStock(
              specId,
              stock[index],
              transaction
            );
          }
        } else {
          await app.model.Food.updateStock(
            cartFoodInfo.food_id,
            stock,
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
    return this.app.model.OrderList.getList(userId, page * 10);
  }
  orderDetail(id) {
    return this.app.model.OrderList.getDetail(id);
  }
  async orderPay(id) {
    const { app } = this;
    const orderStatus = 'PAY';
    try {
      let transaction = await app.model.transaction();
      const nowTime = new Date();
      await app.model.OrderStatusTime.updateStatus(
        id,
        { pay_time: nowTime },
        transaction
      );
      await app.model.OrderList.chagneOrderStatus(orderStatus, id, transaction);
      return { status: true, msg: '支付成功' };
    } catch (e) {
      console.log(e);
      return { status: false, msg: '支付失败' };
    }
  }
  async cancelOrder(id) {
    let orderStatus = 'ORDER_CANCEL';
    const { app } = this;
    const nowTime = new Date();
    try {
      let transaction = await app.model.transaction();
      await app.model.OrderStatusTime.updateStatus(
        id,
        { cancel_time: nowTime },
        transaction
      );
      await app.model.OrderList.chagneOrderStatus(orderStatus, id, transaction);
      return { status: true, msg: `成功取消该订单` };
    } catch (e) {
      console.log(e);
      return { status: false, msg: '取消订单失败' };
    }
  }
  async setSchedules(id, timeEnd) {
    const { app } = this;
    await app.redis.get('order').set(id, 1);
    const expireTime = app.getResidualTime(timeEnd);
    await app.redis.get('order').expire(id, expireTime);
  }
}

module.exports = OrderService;
