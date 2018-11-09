'use strict';
module.exports = appInfo => {
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1529728888599_1732';

  // add your config here
  config.middleware = [];

  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: false, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
    },
    domainWhiteList: ['localhost:8080'],
  };
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  config.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    password: '5634398',
    database: 'mt',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };
  config.middleware = ['error', 'notfoundHandler'];

  config.jwt = {
    secret: 'mt',
    time: 60 * 60 * 24 * 30,
  };
  // 请求响应code
  config.codeMap = {
    '-1': '请求失败',
    200: '请求成功',
    401: '权限校验失败',
    403: 'Forbidden',
    404: 'URL资源未找到',
    422: '参数校验失败',
    500: '服务器错误',
    4000: '您还没有登录，请登陆后再进行操作',
    4001: '您的账号已在其他机器保持登录，如果继续将清除其他机器的登录状态',
    4002: '您的登录状态已过期，请重新登录',
  };
  // bcryptjs 盐
  config.slat = 2;
  return config;
};
