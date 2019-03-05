const cancel = require('./app/utils/cancelOrder.js');
module.exports = app => {
	app.beforeStart(async () => {
		new cancel(app);
		await app.runSchedule('cancelOrder');
	});
};
