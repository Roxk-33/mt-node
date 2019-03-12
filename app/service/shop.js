'use strict';

const Service = require('egg').Service;
const geohash = require('ngeohash');

class ShopService extends Service {
	async getShopList(data) {
		let geohashVal = geohash.encode(data.lat, data.lng, 10);

		let len = geohashVal.length - 3 - data.page;
		// // 八个方向
		// let geohashValArr = geohash.neighbors(geohashVal);
		// geohashValArr = geohashValArr.map(item => {
		// 	console.log('item:', item);
		// 	item = item.substr(0, len);
		// 	return item;
		// });
		geohashVal = geohashVal.substr(0, len);
		const offset = parseInt(data.total);
		return this.app.model.Shop.getListByLoc(geohashVal, offset);
	}
	getShopDetail(id) {
		return this.app.model.Shop.getDetail(id);
	}
	// 检测商品是否有库存
	async detectStock(cartFoodInfo) {
		let result = {
			status: false,
			stock: null,
		};

		const foodInfo = await this.app.model.Food.getItem(cartFoodInfo.food_id);
		// 该商品是规格商品
		if (cartFoodInfo.spec_arr.length) {
			result.stock = [];
			result.status = !cartFoodInfo.spec_arr.some(item => {
				let index = foodInfo.spec_arr.findIndex(_item => _item.id == item);
				// 商品库存
				let stock = foodInfo.spec_arr[index].stock;
				// 购买数量大于库存
				if (stock < cartFoodInfo.num) return true;
				result.stock.push(stock - cartFoodInfo.num);
				return false;
			});
		} else if (foodInfo.stock >= cartFoodInfo.num) {
			result.status = true;
			result.stock = foodInfo.stock - cartFoodInfo.num;
		}
		return result;
	}
	getShopReviewList(id, page) {
		return this.app.model.OrderReview.getShopReviewList(id, page * 10);
	}
}

module.exports = ShopService;
