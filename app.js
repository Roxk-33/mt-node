const cancel = require('./app/schedules/cancelOrder.js');
module.exports = app => {
  app.beforeStart(async () => {
    new cancel(app);
  });
};
