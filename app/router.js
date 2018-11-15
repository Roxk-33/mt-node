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

  // 获取购物车
  router.get('/api/v1/user/cart', verfiyToken, controller.cartList.getList);

  // 修改购物车内的商品
  router.put('/api/v1/user/cart', verfiyToken, controller.cartList.updateItem);

  // 新增商品到购物车
  router.post('/api/v1/user/cart', verfiyToken, controller.cartList.create);

  // 去结算-入口为商店内，结算商品是该商店购物车全部商品
  // 去结算-入口为购物车，结算商品是该商店购物车部分（也有可能是全部）商品
  // 具体展示那些商品由前端处理
  router.get(
    '/api/v1/user/cart/settle/:shopId',
    verfiyToken,
    controller.cartList.getListByShop
  );

  // 创建订单
  router.post('/api/v1/order', verfiyToken, controller.order.orderCreate);

  router.get('/api/v1/user/order', verfiyToken, controller.order.list);
  router.get('/api/v1/user/order/:id', verfiyToken, controller.order.detail);
};
