'use strict';
module.exports = appInfo => {
  const config = (exports = {});
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

  return config;
};
