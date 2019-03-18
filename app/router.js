'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
	const { router, controller, middleware } = app;
	const verfiyToken = middleware.verfiyToken(null, app);
	// 用户
	router.post('/client/user/login', controller.user.login); //-登录
	router.get('/client/user/logout', controller.user.logout); //-登出
	router.get('/client/user', verfiyToken, controller.user.getUserInfo); //-获取用户信息
	router.put('/client/user', verfiyToken, controller.user.updateUserInfo); //-更新用户信息
	router.get('/client/user/address', verfiyToken, controller.user.getAddressList); //-获取用户收货地址
	router.get('/client/user/address/:id', verfiyToken, controller.user.getAddressDetail); //-获取用户收货地址详情
	router.get('/client/user/phone/vercode', verfiyToken, controller.user.getVercode); //-获取手机修改验证码
	router.post('/client/user/register', controller.user.register);
	router.post('/client/user/address', verfiyToken, controller.user.addAddress);
	router.put('/client/user/address', verfiyToken, controller.user.editAddress);
	router.post('/client/user/avatar', verfiyToken, controller.user.uploadAvatar);

	router.delete('/client/user/address/:id', verfiyToken, controller.user.delAddress);
	// 评价
	router.get('/client/user/review/', verfiyToken, controller.user.getUserReviewList);
	router.delete('/client/user/review/:id', verfiyToken, controller.user.deleteReview);

	//店铺-列表
	router.get('/client/shop', controller.shop.getList);
	// 店铺-评价
	router.get('/client/shop/:id/review', controller.shop.getShopReview);
	//店铺-详情
	router.get('/client/shop/:id', controller.shop.getItem);

	// 获取购物车
	router.get('/client/user/cart', verfiyToken, controller.cartList.list);

	// 修改购物车内的商品
	router.put('/client/user/cart', verfiyToken, controller.cartList.updateItem);

	// 新增商品到购物车
	router.post('/client/user/cart', verfiyToken, controller.cartList.create);
	// 清空某商店的购物车
	router.delete('/client/user/cart/shop/:shopId', verfiyToken, controller.cartList.empty);
	// 删除购物车里商品
	router.delete('/client/user/cart/food/:id', verfiyToken, controller.cartList.deleteFood);

	// 去结算-入口为商店内，结算商品是该商店购物车全部商品
	// 去结算-入口为购物车，结算商品是该商店购物车部分（也有可能是全部）商品
	// 具体展示那些商品由前端处理
	router.get('/client/user/cart/settle/:shopId', verfiyToken, controller.cartList.getListByShop);

	// 创建订单
	router.post('/client/order', verfiyToken, controller.order.create);
	router.put('/client/order/pay', verfiyToken, controller.order.payOrder);
	router.get('/client/order/pay/:id', verfiyToken, controller.order.getOrderPayInfo);

	// 用户-订单
	router.get('/client/user/order', verfiyToken, controller.order.list);
	router.get('/client/user/order/:id', verfiyToken, controller.order.detail);
	router.put('/client/user/order/:id/confirm', verfiyToken, controller.order.confirmOrder);
	router.put('/client/user/order/:id/refund', verfiyToken, controller.order.applyRefund); // 申请退款
	// 用户-取消订单
	router.put('/client/user/order/:id', verfiyToken, controller.order.cancel);
	// 评价
	router.post('/client/user/order/:id/review', verfiyToken, controller.order.review);
};
