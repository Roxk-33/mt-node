const bcrypt = require('bcryptjs');
module.exports = {
  mdPassWord(psw) {
    const salt = bcrypt.genSaltSync(this.config.slat);
    return bcrypt.hashSync(psw, salt);
  },
  bcompare(psw, hash) {
    return bcrypt.compareSync(psw, hash);
  },
};
