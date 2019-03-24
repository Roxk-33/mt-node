'use strict';
const jwt = require('jsonwebtoken');

module.exports = (opt, app) => {
	return async (ctx, next) => {
		const Authorization = ctx.request.headers.authorization;
		if (!Authorization) {
			ctx.fail(401);
			return;
		}
		const token = Authorization.split(' ')[1] || null;
		if (token) {
			let result = verifyToken(token, app.config.jwt.secret);

			let { id } = result;
			if (id) {
				let redis_token = await app.redis.get('user').get('userId:' + id);
				console.log('111:' + redis_token);
				if (redis_token === token) {
					if (id) {
						ctx.mt = {};
						ctx.mt.id = id;
						await next(id);
					} else {
						// 如果不是最新token，则代表用户在另一个机器上进行操作，需要用户重新登录保存最新token
						ctx.fail(4001);
					}
				}
			} else {
				// 如果token不合法，则代表客户端token已经过期或者不合法（伪造token）
				ctx.fail(4002);
			}
		} else {
			// 如果token为空，则代表客户没有登录
			ctx.fail(4000);
		}
	};
};
function verifyToken(token, cert) {
	let res = '';
	try {
		let result = jwt.verify(token, cert) || {};
		let { exp, iat, data } = result,
			current = Math.floor(Date.now() / 1000);
		if (current <= exp) {
			res = data || {};
		} else {
		}
	} catch (e) {}
	return res;
}
