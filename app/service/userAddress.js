'use strict';

const Service = require('egg').Service;

class UserAddressService extends Service {
  getAddressList(id) {
    return this.app.model.UserAddress.getList(id);
  }
  createAddress(id, data) {
    data.user_id = id;
    return this.app.model.UserAddress.createItem(data);
  }
  updataAddress(id, data) {
    return this.app.model.UserAddress.updateItem(id, data);
  }
  delAddress(id) {
    return this.app.model.UserAddress.deleteItem(id);
  }
}

module.exports = UserAddressService;
