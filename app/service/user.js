'use strict';

const utility = require('utility');
const uuid = require('uuid');
const Service = require('egg').Service;

class UserService extends Service {
  addAddress(address, id) {
    const update = {
      user_id: 1,
      address: address.address,
      is_default: address.is_default || 0,
      street: address.street,
      tag: address.tag || '',
    };
    return this.app.mysql.insert('user_address', update);
  }
}

module.exports = UserService;
