'use strict';

module.exports = app => {
	const { router, controller, middleware } = app;

	router.post('/v1/admin/login', controller.admin.login); //-登录
};
