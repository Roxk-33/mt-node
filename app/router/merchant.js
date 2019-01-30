'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;
  // 商家相关
  router.post('/v1/merchant/register', controller.merchant.register); //-注册
};
