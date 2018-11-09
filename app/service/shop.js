'use strict';

const Service = require('egg').Service;

class ShopService extends Service {
  getShopList() {
    return this.app.model.Shop.getList();
  }
  getShopDetail(id) {
    return this.app.model.Shop.getDetail(id);
  }
}

module.exports = ShopService;
