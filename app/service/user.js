'use strict';

const Service = require('egg').Service;
class UserService extends Service {
	async login(data) {
		const { ctx, app } = this;
		let { password, account } = data;
		let result = false;
		const expireTime = app.config.jwt.time;
		const user = await app.model.User.getItemByAccount(account);
		if (!!user) {
			result = ctx.helper.bcompare(password, user.dataValues.password);
			if (result) {
				let token = app.generateToken({ id: user.id });
				await app.redis.get('user').set('userId:' + user.id, token);
				await app.redis.get('user').expire('userId:' + user.id, expireTime);
				let _user = Object.assign(
					{},
					{
						account: user.account,
						avatar: user.avatar,
						id: user.id,
						tel: user.tel,
						user_name: user.user_name,
					},
				);
				return { token, _user };
			}
		}

		return result;
	}
	async register(data) {
		const { ctx, app } = this;
		let { password, account } = data;
		let isExist = await this.isExist(account);
		if (isExist) {
			console.log('已经有这个用户');
			return false;
		}
		password = ctx.helper.mdPassWord(password);
		const { dataValues: user } = await app.model.User.createItem({
			password,
			account,
		});
		let token = app.generateToken({ id: user.id });
		return { token, user };
	}
	async getUserInfo(id) {
		const { app } = this;
		const user = await app.model.User.getItem({ id });
		if (!!user) {
			return user;
		}
		return false;
	}
	async updateUserInfo(id, data) {
		const { app, ctx } = this;
		let { action, psw, userName, tel, code } = data;
		let sql = null;
		if (action === 'changeName') {
			sql = { user_name: userName };
		}
		if (action === 'changeTel') {
			let verCode = await app.redis.get('user').get('userId:' + id);
			if (verCode !== code) {
				return { status: false, msg: '验证码错误' };
			}
			sql = { tel: tel };
		}
		if (action === 'changePsw') {
			psw = ctx.helper.mdPassWord(psw);
			sql = { password: psw };
		}
		await app.model.User.updateItem(sql, id);
		return { status: true, msg: '修改成功' };
	}
	// 检查帐号，帐号是否已存在
	isExist(account) {
		return this.app.model.User.userIsExist(account);
	}

	// 获取评价列表
	getUserReviewList(userId, page) {
		return this.app.model.OrderReview.getUserReviewList(userId, page * 10);
	}
	// 删除评价
	deleteReview(id) {
		return this.app.model.OrderReview.deleteItem(id);
	}
	// 获取验证码
	async getVercode(phone) {
		const { app, ctx } = this;
		const userId = ctx.mt.id;
		const expireTime = app.config.verCodeTime;
		const userRedis = await app.redis.get('user');

		const isExist = await app.model.User.getItem({ tel: phone });
		const code = 1234;
		// const code = Math.floor(Math.random() * 8999 + 1000) + 1;
		if (!isExist) {
			// 生成验证码
			await userRedis.set('userCode:' + userId, code);
			await userRedis.expire('userCode:' + userId, expireTime);
			return { status: true, msg: '验证码已发送', data: code };
		}
		return { status: false, msg: '已存在该手机号' };
	}
	async uploadAvatar() {
		const { app, ctx } = this;
		const folder = 'userAvatar';
		const result = await ctx.uploadImage(folder);
		await app.model.User.updateItem({ avatar: result.data }, ctx.mt.id);
		return result;
	}

	getAddressInfo(id) {
		return this.app.model.UserAddress.getItem(id);
	}
	getAddressList(id) {
		return this.app.model.UserAddress.getList(id);
	}
	createAddress(id, data) {
		data.user_id = id;
		return this.app.model.UserAddress.createItem(data);
	}
	updataAddress(data) {
		return this.app.model.UserAddress.updateItem(data.id, data);
	}
	delAddress(id) {
		return this.app.model.UserAddress.deleteItem(id);
	}
}

module.exports = UserService;
