'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  const verfiyToken = middleware.verfiyToken(null, app);
  const userRouter = app.router.namespace('/user');
  // 用户
  router.post('/api/v1/user/login', controller.user.login); //-登录
  router.get('/api/v1/user/logout', controller.user.logout); //-登出
  router.get('/api/v1/user', verfiyToken, controller.user.getInfo); //-获取用户信息
  router.get('/api/v1/user/address', verfiyToken, controller.user.addressList); //-获取用户收货地址
  router.post('/api/v1/user/register', controller.user.register);
  router.post('/api/v1/user/address', verfiyToken, controller.user.addAddress);

  //店铺-列表
  router.get('/api/v1/shop', controller.shop.getList);
  //店铺-详情
  router.get('/api/v1/shop/:id', controller.shop.getItem);

  // 购物车
  router.get(
    '/api/v1/user/cart',
    verfiyToken,
    controller.cartList.getList
  );
  router.get(
    '/api/v1/user/cart/settle/:shopId',
    verfiyToken,
    controller.cartList.getListByShop
  );
  router.put(
    '/api/v1/user/cart',
    verfiyToken,
    controller.cartList.updateItem
  );
  router.post('/api/v1/user/cart', verfiyToken, controller.cartList.create);
  router.post('/api/v1/order/pay', verfiyToken, controller.order.orderPay);
};
