const jwt = require('jsonwebtoken');
module.exports = {
  isString(obj) {
    return typeof obj == 'string';
  },
  generateToken(data) {
    const created = Math.floor(Date.now() / 1000);
    const exp = created + this.config.jwt.time;
    return jwt.sign({ data, exp }, this.config.jwt.secret);
  },
};
