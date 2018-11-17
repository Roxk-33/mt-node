'use strict';

const Service = require('egg').Service;

class UserAddressService extends Service {
  getAddressInfo(id) {
    return this.app.model.UserAddress.getItem(id);
  }
  getAddressList(id) {
    return this.app.model.UserAddress.getList(id);
  }
  createAddress(id, data) {
    data.user_id = id;
    return this.app.model.UserAddress.createItem(data);
  }
  updataAddress(data) {
    return this.app.model.UserAddress.updateItem(data.id, data);
  }
  delAddress(id) {
    return this.app.model.UserAddress.deleteItem(id);
  }
}

module.exports = UserAddressService;
