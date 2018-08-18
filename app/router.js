'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  const userRouter = app.router.namespace('/user');
  // 用户-登录
  router.get('/api/v1/user/login', controller.user.login);
  router.post('/api/v1/user/address', controller.user.addAddress);
};
