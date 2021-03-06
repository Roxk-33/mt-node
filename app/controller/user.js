'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
	get rules() {
		return {
			create: {
				password: {
					type: 'password',
					required: true,
					allowEmpty: false,
					min: 6,
				},
				account: { type: 'string', required: true },
			},
			item: {
				password: {
					type: 'password',
					required: true,
					allowEmpty: false,
					min: 6,
				},
				account: { type: 'string', required: true },
			},

			updateUser: {
				action: {
					type: 'string',
					required: true,
				},
			},
			address: {
				address: {
					type: 'string',
					required: true,
				},
				tel: { type: 'string', required: true },
			},
			delete: {
				id: {
					type: 'string',
					required: true,
				},
			},
			addressItem: {
				id: {
					type: 'string',
					required: true,
				},
			},
			getUserReviewList: {
				page: {
					type: 'string',
					required: true,
				},
			},
			deleteReview: {
				id: {
					type: 'string',
					required: true,
				},
			},
			getVercode: {
				phone: {
					type: 'string',
					required: true,
				},
			},
		};
	}

	async login() {
		const { ctx, service } = this;
		const data = ctx.validateBody(this.rules.item, ctx);
		const result = await service.user.login(data);
		if (!!result) ctx.success(result);
		else {
			ctx.fail('帐号或密码不存在');
		}
	}
	async logout() {
		const { ctx } = this;
		ctx.success('登出成功');
	}
	async register() {
		const { ctx, service } = this;
		const data = ctx.validateBody(this.rules.create, ctx);
		const result = await service.user.register(data);
		if (!!result) ctx.success(result);
		else {
			ctx.fail('帐号已存在');
		}
	}
	// 获取用户信息
	async getUserInfo() {
		const { ctx, service } = this;
		const result = await service.user.getUserInfo(ctx.mt.id);
		if (!!result) ctx.success(result);
		else {
			ctx.fail('不存在该帐号');
		}
	}
	// 更新用户信息
	// action:['changeName','changeTel','changePsw']
	async updateUserInfo() {
		const { ctx, service } = this;
		const data = ctx.validateBody(this.rules.updateUser, ctx);

		const { status, msg } = await service.user.updateUserInfo(ctx.mt.id, data);
		if (status) ctx.success(msg);
		else {
			ctx.fail('修改失败');
		}
	}
	// 更换用户头像
	async uploadAvatar() {
		const { ctx, service } = this;
		const { status, data } = await service.user.uploadAvatar();
		if (status) {
			ctx.success({ url: data }, '上传成功');
		} else {
			ctx.fail('修改失败');
		}
	}

	async getAddressList() {
		const { ctx, service } = this;
		const result = await service.user.getAddressList(ctx.mt.id);
		if (!!result) ctx.success(result);
		else {
			ctx.fail();
		}
	}
	// 获取用户地址列表
	async getAddressDetail() {
		const { ctx, service } = this;
		const { id } = ctx.validateParams(this.rules.addressItem, ctx);
		const result = await service.user.getAddressInfo(id);
		if (!!result) ctx.success(result);
		else {
			ctx.fail();
		}
	}
	async addAddress() {
		const { ctx, service } = this;
		const data = ctx.validateBody(this.rules.address, ctx);
		const result = await service.user.createAddress(ctx.mt.id, data);
		if (!!result) ctx.success('添加成功');
		else {
			ctx.fail();
		}
	}
	async editAddress() {
		const { ctx, service } = this;
		const data = ctx.validateBody(this.rules.address, ctx);
		const result = await service.user.updataAddress(data);
		if (!!result) ctx.success('修改成功');
		else {
			ctx.fail();
		}
	}
	async delAddress() {
		const { ctx, service } = this;
		const { id } = ctx.validateParams(this.rules.delete, ctx);
		const result = await service.user.delAddress(id);
		if (!!result) ctx.success('删除成功');
		else {
			ctx.fail();
		}
	}
	// 用户评价列表
	async getUserReviewList() {
		const { ctx, service } = this;
		const { page } = ctx.validateQuery(this.rules.getUserReviewList, ctx);
		const result = await service.user.getUserReviewList(ctx.mt.id, page);
		if (!!result) ctx.success(result);
		else {
			ctx.fail();
		}
	}
	async deleteReview() {
		const { ctx, service } = this;
		const { id } = ctx.validateParams(this.rules.deleteReview, ctx);
		const result = await service.user.deleteReview(id);
		if (!!result) ctx.success(result);
		else {
			ctx.fail();
		}
	}
	// 获取修改手机号的验证码
	async getVercode() {
		const { ctx, service } = this;
		const { phone } = ctx.validateQuery(this.rules.getVercode, ctx);
		const { status, msg, data: code } = await service.user.getVercode(phone);
		if (status) {
			ctx.success({ code }, msg);
		} else {
			ctx.fail(msg);
		}
	}
}

module.exports = UserController;
