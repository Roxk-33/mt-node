'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  const verfiyToken = middleware.verfiyToken(null, app);
  const userRouter = app.router.namespace('/user');
  // 用户
  router.post('/v1/user/login', controller.user.login); //-登录
  router.get('/v1/user/logout', controller.user.logout); //-登出
  router.get('/v1/user', verfiyToken, controller.user.getInfo); //-获取用户信息
  router.put('/v1/user', verfiyToken, controller.user.updateInfo); //-更新用户信息
  router.get('/v1/user/address', verfiyToken, controller.user.addressList); //-获取用户收货地址
  router.get('/v1/user/address/:id', verfiyToken, controller.user.address); //-获取用户收货地址详情
  router.get('/v1/user/phone/vercode', verfiyToken, controller.user.getVercode); //-获取手机修改验证码
  router.post('/v1/user/register', controller.user.register);
  router.post('/v1/user/address', verfiyToken, controller.user.addAddress);
  router.put('/v1/user/address', verfiyToken, controller.user.editAddress);
  router.post('/v1/user/avatar', verfiyToken, controller.user.uploadAvatar);

  router.delete(
    '/v1/user/address/:id',
    verfiyToken,
    controller.user.delAddress
  );
  // 评价
  router.get('/v1/user/evaluation/', verfiyToken, controller.user.evalList);
  router.delete(
    '/v1/user/evaluation/:id',
    verfiyToken,
    controller.user.deleteEval
  );

  //店铺-列表
  router.get('/v1/shop', controller.shop.getList);
  //店铺-详情
  router.get('/v1/shop/:id', controller.shop.getItem);

  // 获取购物车
  router.get('/v1/user/cart', verfiyToken, controller.cartList.getList);

  // 修改购物车内的商品
  router.put('/v1/user/cart', verfiyToken, controller.cartList.updateItem);

  // 新增商品到购物车
  router.post('/v1/user/cart', verfiyToken, controller.cartList.create);
  // 清空某商店的购物车
  router.delete(
    '/v1/user/cart/:shopId',
    verfiyToken,
    controller.cartList.empty
  );

  // 去结算-入口为商店内，结算商品是该商店购物车全部商品
  // 去结算-入口为购物车，结算商品是该商店购物车部分（也有可能是全部）商品
  // 具体展示那些商品由前端处理
  router.get(
    '/v1/user/cart/settle/:shopId',
    verfiyToken,
    controller.cartList.getListByShop
  );

  // 创建订单
  router.post('/v1/order', verfiyToken, controller.order.orderCreate);
  router.put('/v1/order/pay', verfiyToken, controller.order.orderPay);
  router.get(
    '/v1/order/pay/:id',
    verfiyToken,
    controller.order.getOrderPayInfo
  );

  router.get('/v1/user/order', verfiyToken, controller.order.list);
  router.get('/v1/user/order/:id', verfiyToken, controller.order.detail);
  router.put('/v1/user/order/:id', verfiyToken, controller.order.cancel);
  router.post(
    '/v1/user/order/:id/review',
    verfiyToken,
    controller.order.review
  );
};
