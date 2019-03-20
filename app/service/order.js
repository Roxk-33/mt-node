'use strict';

const Service = require('egg').Service;
class OrderService extends Service {
	// 计算总价
	async calTotalPrice(userId, shopId, cartIdArr) {
		const { service } = this;

		const cartList = await service.cartList.getCartListByShop(userId, shopId);
		const shopInfo = cartList[0].shop_info;
		// 总价，先加上运费
		let totalPrice = shopInfo.freight || 0;
		const len = cartList.length;
		// 选购的商品
		const cartListBuy = [];
		for (let i = 0; i < len; i++) {
			const item = cartList[i];

			// 未选中该商品
			// cartIdArr为空则表示选购全部
			if (cartIdArr.length && cartIdArr.indexOf(item.id) === -1) continue;

			// 折扣商品
			if (item.food_info.discount_info === null) {
				item.price = item.food_info.price;
			} else {
				item.price = item.food_info.discount_info.discount;
			}

			item.food_name = item.food_info.food_name;
			item.picture = item.food_info.picture;
			item.specText = [];
			// 规格产品,需要加上规格价格
			if (item.spec_arr.length) {
				item.price = item.spec_arr.reduce((price, current) => {
					const specArr = item.food_info.spec_arr;
					const index = specArr.findIndex(specItem => current == specItem.id);
					price += specArr[index].price;
					let label = specArr[index].label;
					item.specText.push(label);
					console.log(item.specText, specArr[index], specArr[index].label);
					return price;
				}, item.food_info.price);
			}
			cartListBuy.push(item);
			totalPrice += item.price;
		}
		return { totalPrice, shopInfo, cartList: cartListBuy };
	}
	async orderCreate(userId, orderData) {
		const { service, app } = this;
		// 获取购物车信息
		const { shopId, address, remarks, cartIdArr, arrivalTime, tableware } = orderData;

		// 预计到达时间
		let _arrivalTime = new Date();
		// 总价
		const result = await this.calTotalPrice(userId, shopId, cartIdArr);
		const { totalPrice, shopInfo, cartList } = result;

		// 创建订单
		let transaction;
		try {
			transaction = await app.model.transaction();
			const dead_line_time = new Date();
			// 设定超时未支付的时间
			dead_line_time.setSeconds(dead_line_time.getSeconds() + app.config.pay.deadline);

			// 创建订单
			const { dataValues: orderInfo } = await app.model.OrderList.createOrder(
				{
					user_id: userId,
					shop_id: shopId,
					remarks: remarks,
					address: address.address + '' + address.stress,
					total_price: totalPrice,
					freight: shopInfo.freight,
					tel: address.tel,
					user_name: address.user_name,
					user_sex: address.user_sex,
					tableware_num: tableware,
				},
				transaction,
			);
			const { dataValues: orderStatus } = await app.model.OrderStatusTime.createStatus(
				{
					order_id: orderInfo.id,
					created_at: orderInfo.created_at,
					deadline_pay_time: dead_line_time,
					predict_arrival_time: _arrivalTime,
				},
				transaction,
			);
			orderInfo.order_status = orderStatus;
			const len = cartList.length;
			for (let index = 0; index < len; index++) {
				const cartFoodInfo = cartList[index];
				// const { status, stock } = await service.shop.detectStock(cartFoodInfo);
				// // 无库存
				// if (!status) {
				// 	throw cartFoodInfo;
				// }
				await app.model.OrderItem.createOrderFood(
					{
						user_id: userId,
						order_id: orderInfo.id,
						food_id: cartFoodInfo.food_id,
						spec_text: cartFoodInfo.specText,
						price: cartFoodInfo.price,
						num: cartFoodInfo.num,
						food_picture: cartFoodInfo.picture,
						food_name: cartFoodInfo.food_name,
					},
					transaction,
				);

				// 删除购物车中已买商品
				await app.model.CartList.deleteItem({ id: cartFoodInfo.id }, transaction);
				// NOTE: 暂时屏蔽库存模块
				// // 规格类产品库存放在规格表
				// if (cartFoodInfo.spec_arr.length) {
				// 	for (let index = 0; index < cartFoodInfo.spec_arr.length; index++) {
				// 		const specId = cartFoodInfo.spec_arr[index];
				// 		await app.model.FoodSpec.updateStock(specId, stock[index], transaction);
				// 	}
				// } else {
				// 	// 更新库存
				// 	await app.model.Food.updateStock(cartFoodInfo.food_id, stock, transaction);
				// }
				if (index === len - 1) {
					await transaction.commit();
				}
			}
			// 设定redis超时回调函数
			this.setSchedules(orderInfo.id, dead_line_time);

			// 存储orderID
			let orderIdStr = await app.redis.get('shop_order').get(shopId);
			if (!orderIdStr) {
				orderIdStr = orderInfo.id;
			} else {
				orderIdStr += ',' + orderInfo.id;
			}
			await app.redis.get('shop_order').set(shopId, orderIdStr);

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
	orderList(userId, page, type) {
		let condition = { user_id: userId };

		if (type === 'all') {
			return this.app.model.OrderList.getList(condition, page * 10);
		}
		if (type === 'review') {
			return this.app.model.OrderList.getList({ ...condition, review_status: 0, status: 'ORDER_SUCCESS' }, page * 10);
		}
		if (type === 'refund') {
			return this.app.model.OrderList.geRefundList(userId, page * 10);
		}
	}

	orderDetail(id) {
		return this.app.model.OrderList.getDetail({ id });
	}
	getOrderPayInfo(id) {
		return this.app.model.OrderList.getOrderPayInfo(id);
	}
	// 支付订单
	async payOrder(id) {
		const { app } = this;
		const orderStatus = 'PAY';
		try {
			let transaction = await app.model.transaction();
			const nowTime = new Date();
			await app.model.OrderStatusTime.updateStatus(id, { pay_time: nowTime }, transaction);
			await app.model.OrderList.changeOrderStatus(orderStatus, id, transaction);
			await transaction.commit();
			return { status: true, msg: '支付成功' };
		} catch (e) {
			console.log(e);
			await transaction.rollback();

			return { status: false, msg: '支付失败' };
		}
	}
	// 申请退款
	async applyRefund(data, userId) {
		const orderStatus = 'ORDER_REFUNDING';
		const { app } = this;
		const nowTime = new Date();
		try {
			let transaction = await app.model.transaction();
			await app.model.OrderStatusTime.updateStatus(datda.orderId, { apply_refund_time: nowTime }, transaction);
			await app.model.OrderList.changeOrderStatus(orderStatus, datda.orderId, transaction);
			await transaction.commit();
			return { status: true, msg: `申请成功` };
		} catch (error) {
			console.log(error);
			await transaction.rollback();
			return { status: false, msg: '申请失败' };
		}
	}
	// 取消订单
	async cancelOrder(id, userId) {
		const { app } = this;
		const nowTime = new Date();
		// 订单只有在『已支付』状态才能取消
		const orderDetail = await app.model.OrderList.getDetail({ id, user_id: userId });
		if (!orderDetail) {
			return { status: false, msg: '非法操作' };
		}
		if (['ORDER_SUCCESS', 'ORDER_REFUNDING', 'ORDER_CANCEL', 'ORDER_CANCEL_TIMEOUT'].includes(orderDetail.status)) {
			return { status: false, msg: '当前订单状态不允许取消订单' };
		}

		let orderStatus = '';
		let orderStatusTime = '';
		let successMsg = '';
		// 判断商家是否已经接单
		if (['UNPAY', 'PAY'].includes(orderDetail.status)) {
			orderStatus = 'ORDER_CANCEL';
			orderStatusTime = { cancel_time: nowTime };
			successMsg = '成功取消订单';
		}
		// 已接单,需要商家同意才能取消订单
		if (orderDetail.status === 'ONTHEWAY') {
			orderStatus = 'ORDER_REFUNDING';
			orderStatusTime = { apply_refund_time: nowTime };
			successMsg = '成功申请取消订单';
		}
		console.log('orderStatusTime:', orderDetail.status);
		let transaction = await app.model.transaction();
		try {
			await app.model.OrderStatusTime.updateStatus(id, orderStatusTime, transaction);
			await app.model.OrderList.changeOrderStatus(orderStatus, id, transaction);
			await transaction.commit();
			return { status: true, msg: successMsg };
		} catch (e) {
			console.log(e);
			await transaction.rollback();
			return { status: false, msg: '操作失败' };
		}
	}
	async setSchedules(id, timeEnd) {
		const { app } = this;
		await app.redis.get('cancel_order').set(id, 1);
		const expireTime = app.getResidualTime(timeEnd);
		await app.redis.get('cancel_order').expire(id, expireTime);
	}
	// 评价商品
	async reviewOrder(data, user_id, order_id) {
		const { app } = this;
		let {
			evalTasteStar: taste_rate,
			evalPackingStar: packing_rate,
			evalShopStar: rate,
			// isSatisfied: distribution_rate,
			// distributionType: distribution_type,
			distributionTime: distribution_time,
			remarks,
			shopId: shop_id,
		} = data;
		// distribution_rate = distribution_rate ? 1 : 0;
		try {
			let transaction = await app.model.transaction();
			let postData = {
				remarks,
				// distribution_type,
				// distribution_rate,
				distribution_time,
				rate,
				packing_rate,
				taste_rate,
				user_id,
				shop_id,
				order_id,
			};

			const isExist = await app.model.OrderReview.getItem({ order_id });
			if (isExist) {
				return { status: false, msg: '该订单已评价' };
			}

			await app.model.OrderReview.createReview(postData, transaction);
			// 标志订单已评价
			await app.model.OrderList.updateReview(order_id, transaction);
			await transaction.commit();

			return { status: true, msg: '评价成功' };
		} catch (error) {
			console.log(error);
			await transaction.rollback();
			return { status: false, msg: '评价失败' };
		}
	}
	// 确认送达
	async confirmOrder(shopId, orderId) {
		const { app } = this;
		const nowTime = new Date();
		try {
			let transaction = await app.model.transaction();
			await app.model.OrderStatusTime.updateStatus(orderId, { complete_time: nowTime }, transaction);
			await app.model.OrderList.changeOrderStatus('ORDER_SUCCESS', orderId, transaction);
			await app.model.Shop.updateMonthSale(shopId, transaction);
			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			return { status: false, msg: '操作失败' };
		}
		return { status: true, msg: 'ok' };
	}
}

module.exports = OrderService;
