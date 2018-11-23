class cancelOrder {
  constructor(app) {
    const sub = app.redis.get('sub');
    const order = app.redis.get('order');
    const cancel = this.cancel.bind(this);
    sub.psubscribe('__keyevent@' + 1 + '__:expired');
    sub.on('pmessage', async function(pattern, channel, expiredKey) {
      console.log(arguments);
      cancel(expiredKey, app);
    });
  }
  async cancel(id, app) {
    let orderStatus = 'ORDER_CANCEL_TIMEOUT';
    const { status } = await app.model.Order.getDetail(id);
    if (status === 'UNPAY') {
      return app.model.Order.chagneOrderStatus(orderStatus, id);
    }
    return;
  }
}

module.exports = cancelOrder;
