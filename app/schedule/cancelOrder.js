const Subscription = require('egg').Subscription;

class CancelOrder extends Subscription {
	// 通过 schedule 属性来设置定时任务的执行间隔等配置
	static get schedule() {
		return {
			interval: '1h',
			type: 'worker',
		};
	}

	// subscribe 是真正定时任务执行时被运行的函数
	async subscribe() {
		this.ctx.service.order.cleanOverTimeOrder();
		console.log('定时器开始');
	}
}

module.exports = CancelOrder;
