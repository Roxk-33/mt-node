'use strict';

const Service = require('egg').Service;

class OrderService extends Service {
	async orderCreate(userId, orderData) {
		const { service, app } = this;
		// 获取购物车信息
		const { shopId, address, remarks, cartIdArr, arrivalTime, tableware } = orderData;

		const cartList = await service.cartList.getCartListByShop(userId, shopId);
		const shopInfo = cartList[0].shop_info;
		// 预计到达时间
		let _arrivalTime = new Date(arrivalTime);
		// 总价
		const totalPrice = cartList.reduce((previous, current) => (previous += current.num * current.price), shopInfo.freight);
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
					tableware_num: tableware
				},
				transaction
			);
			const { dataValues: orderStatus } = await app.model.OrderStatusTime.createStatus(
				{
					order_id: orderInfo.id,
					created_at: orderInfo.created_at,
					deadline_pay_time: dead_line_time,
					predict_arrival_time: _arrivalTime
				},
				transaction
			);
			orderInfo.order_status = orderStatus;
			const len = cartList.length;
			for (let index = 0; index < len; index++) {
				const cartFoodInfo = cartList[index];
				// 不在所选商品中
				if (cartIdArr.length && cartIdArr.indexOf(cartFoodInfo.id) === -1) continue;
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
						food_name: cartFoodInfo.food_name
					},
					transaction
				);

				// 删除购物车中已买商品
				await app.model.CartList.deleteItem({ id: cartFoodInfo.id }, transaction);
				// 规格类产品库存放在规格表
				if (cartFoodInfo.spec_arr.length) {
					for (let index = 0; index < cartFoodInfo.spec_arr.length; index++) {
						const specId = cartFoodInfo.spec_arr[index];
						await app.model.FoodSpec.updateStock(specId, stock[index], transaction);
					}
				} else {
					// 更新库存
					await app.model.Food.updateStock(cartFoodInfo.food_id, stock, transaction);
				}
				if (index === len - 1) {
					await transaction.commit();
				}
			}
			// 设定redis超时回调函数
			this.setSchedules(orderInfo.id, dead_line_time);

			// 存储orderID
			let orderIdArr = await app.redis.get('shop_order').get(shopId);
			orderIdArr = orderIdArr
				.split(',')
				.push(orderInfo.id)
				.join(',');
			await app.redis.get('shop_order').set(shopId, orderIdArr);

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
		if (type === 'eval') {
			console.log({ ...condition, review_status: 0 });
			return this.app.model.OrderList.getList({ ...condition, review_status: 0, status: 'ORDER_SUCCESS' }, page * 10);
		}
	}

	orderDetail(id) {
		return this.app.model.OrderList.getDetail(id);
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
		const orderStatus = 'ORDER_REFUND';
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
	// TODO:需要确认是否是订单的用户发起的请求
	async cancelOrder(id) {
		let orderStatus = 'ORDER_CANCEL';
		const { app } = this;
		const nowTime = new Date();
		try {
			let transaction = await app.model.transaction();
			await app.model.OrderStatusTime.updateStatus(id, { cancel_time: nowTime }, transaction);
			await app.model.OrderList.changeOrderStatus(orderStatus, id, transaction);
			await transaction.commit();

			return { status: true, msg: `成功取消该订单` };
		} catch (e) {
			console.log(e);
			await transaction.rollback();
			return { status: false, msg: '取消订单失败' };
		}
	}
	async setSchedules(id, timeEnd) {
		const { app } = this;
		await app.redis.get('order').set(id, 1);
		const expireTime = app.getResidualTime(timeEnd);
		await app.redis.get('order').expire(id, expireTime);
	}
	// 评价商品
	async reviewOrder(data, user_id, order_id) {
		const { app } = this;
		let { evalTasteStar: taste_rate, evalPackingStar: packing_rate, evalShopStar: rate, isSatisfied: distribution_rate, distributionType: distribution_type, distributionTime: distribution_time, evalFood: review_food, remarks, shopId: shop_id } = data;
		review_food = JSON.stringify(review_food);
		distribution_rate = distribution_rate ? 1 : 0;
		try {
			let transaction = await app.model.transaction();
			let postData = {
				remarks,
				review_food,
				distribution_type,
				distribution_rate,
				distribution_time,
				rate,
				packing_rate,
				taste_rate,
				user_id,
				shop_id,
				order_id
			};

			const isExist = await app.model.UserReview.getItem({ order_id });
			if (isExist) {
				return { status: false, msg: '该订单已评价' };
			}

			await app.model.UserReview.createReview(postData, transaction);
			await app.model.OrderList.updateReview(order_id, transaction);
			await transaction.commit();

			return { status: true, msg: '评价成功' };
		} catch (error) {
			console.log(error);
			await transaction.rollback();
			return { status: false, msg: '评价失败' };
		}
	}
	// 确认收货
	async confirmOrder(shopId, orderId) {
		const { app } = this;
		const nowTime = new Date();
		try {
			let transaction = await app.model.transaction();
			await app.model.OrderStatusTime.updateStatus(orderId, { complete_time: nowTime }, transaction);
			await app.model.OrderList.changeOrderStatus('ORDER_SUCCESS', orderId, transaction);
			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			return { status: false, msg: '操作失败' };
		}

		const saleData = await app.model.ShopSale.getItem(shopId);
		console.log(saleData);
		if (!saleData) {
			await app.model.ShopSale.createItem({ shop_id: shopId });
		} else {
			let saleTime = new Date(saleData.created_at);
			console.log(saleTime.getDate(), nowTime.getDate());
			if (saleTime.getDate() == nowTime.getDate()) {
				console.log();
				await app.model.ShopSale.updateItem(++saleData.sale, saleData.id);
			} else {
				await app.model.ShopSale.createItem({ shop_id: shopId });
			}
		}

		return { status: true, msg: 'ok' };
	}
}

module.exports = OrderService;
