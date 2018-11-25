class cancelOrder {
  constructor(app) {
    const sub = app.redis.get('sub');
    const cancel = this.cancel.bind(this);
    sub.psubscribe('__keyevent@' + 1 + '__:expired');
    sub.on('pmessage', async function(pattern, channel, expiredKey) {
      cancel(expiredKey, app);
    });
  }
  async cancel(id, app) {
    let orderStatus = 'ORDER_CANCEL_TIMEOUT';
    const { status } = await app.model.OrderList.getDetail(id);
    if (status === 'UNPAY') {
      try {
        const nowTime = new Date();
        let transaction = await app.model.transaction();
        await app.model.OrderStatusTime.updateStatus(
          id,
          { cancel_time: nowTime },
          transaction
        );
        const result = await app.model.OrderList.chagneOrderStatus(
          orderStatus,
          id,
          transaction
        );
        return { status: true, data: result };
      } catch (e) {
        console.log('自动取消订单失败');
        throw { status: false, msg: e };
      }
    }
  }
}

module.exports = cancelOrder;
