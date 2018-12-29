'use strict';

module.exports = app => {
	const { router, controller, middleware } = app;
	const verfiyToken = middleware.verfiyToken(null, app);
	// 用户
	router.post('/v1/user/login', controller.user.login); //-登录
	router.get('/v1/user/logout', controller.user.logout); //-登出
	router.get('/v1/user', verfiyToken, controller.user.getUserInfo); //-获取用户信息
	router.put('/v1/user', verfiyToken, controller.user.updateUserInfo); //-更新用户信息
	router.get('/v1/user/address', verfiyToken, controller.user.getAddressList); //-获取用户收货地址
	router.get(
		'/v1/user/address/:id',
		verfiyToken,
		controller.user.getAddressDetail,
	); //-获取用户收货地址详情
	router.get('/v1/user/phone/vercode', verfiyToken, controller.user.getVercode); //-获取手机修改验证码
	router.post('/v1/user/register', controller.user.register);
	router.post('/v1/user/address', verfiyToken, controller.user.addAddress);
	router.put('/v1/user/address', verfiyToken, controller.user.editAddress);
	router.post('/v1/user/avatar', verfiyToken, controller.user.uploadAvatar);

	router.delete(
		'/v1/user/address/:id',
		verfiyToken,
		controller.user.delAddress,
	);
	// 评价
	router.get('/v1/user/evaluation/', verfiyToken, controller.user.getEvalList);
	router.delete(
		'/v1/user/evaluation/:id',
		verfiyToken,
		controller.user.deleteEval,
	);

	//店铺-列表
	router.get('/v1/shop', controller.shop.getList);
	//店铺-详情
	router.get('/v1/shop/:id', controller.shop.getItem);
	// 店铺-评价
	router.get('/v1/shop/:id/eval', controller.shop.getEvalList);

	// 获取购物车
	router.get('/v1/user/cart', verfiyToken, controller.cartList.list);

	// 修改购物车内的商品
	router.put('/v1/user/cart', verfiyToken, controller.cartList.updateItem);

	// 新增商品到购物车
	router.post('/v1/user/cart', verfiyToken, controller.cartList.create);
	// 清空某商店的购物车
	router.delete(
		'/v1/user/cart/:shopId',
		verfiyToken,
		controller.cartList.empty,
	);

	// 去结算-入口为商店内，结算商品是该商店购物车全部商品
	// 去结算-入口为购物车，结算商品是该商店购物车部分（也有可能是全部）商品
	// 具体展示那些商品由前端处理
	router.get(
		'/v1/user/cart/settle/:shopId',
		verfiyToken,
		controller.cartList.getListByShop,
	);

	// 创建订单
	router.post('/v1/order', verfiyToken, controller.order.create);
	router.put('/v1/order/pay', verfiyToken, controller.order.payOrder);
	router.get(
		'/v1/order/pay/:id',
		verfiyToken,
		controller.order.getOrderPayInfo,
	);

	// 用户-订单
	router.get('/v1/user/order', verfiyToken, controller.order.list);
	router.get('/v1/user/order/:id', verfiyToken, controller.order.detail);
	router.put(
		'/v1/user/order/:id/confirm',
		verfiyToken,
		controller.order.confirmOrder,
	);
	// 用户-取消订单
	router.put('/v1/user/order/:id', verfiyToken, controller.order.cancel);
	// 评价
	router.post(
		'/v1/user/order/:id/review',
		verfiyToken,
		controller.order.review,
	);
};
