'use strict';

module.exports = appInfo => {
	const config = (exports = {});
	config.sequelize = {
		dialect: 'mysql',
		host: '127.0.0.1',
		port: 3306,
		username: 'root',
		password: 'Alibaba1995',
		database: 'mt',
		pool: {
			max: 5,
			min: 0,
			acquire: 30000,
			idle: 10000,
		},
	};
	config.cluster = {
		listen: {
			port: 3000,
		},
	};
	config.redis = {
		clients: {
			user: {
				port: 6379,
				host: '127.0.0.1',
				password: 'Redis1995',
				db: 0,
			},
			cancel_order: {
				port: 6379,
				host: '127.0.0.1',
				password: 'Redis1995',
				db: 1,
			},
			sub_cancel_order: {
				port: 6379,
				host: '127.0.0.1',
				password: 'Redis1995',
				db: 2,
			},
			shop_order: {
				port: 6379,
				host: '127.0.0.1',
				password: 'Redis1995',
				db: 6,
			},
		},
	};
	config.uploadImgUrl = 'app/public/';
	config.absolutePath = 'https://static.lococo.site/user';

	config.baiduMapAK = 'R1FAL3VEI6ORObBUZZf4kHOHhPeNzRZI';
	// bcryptjs 盐
	config.slat = 4;
	return config;
};
