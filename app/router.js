'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  require('./router/admin')(app);
  require('./router/merchant')(app);
  require('./router/user')(app);
};
