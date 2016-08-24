'use strict';
const CustomerSchema = require('./schemas/customer');

/**
 * @param {Object} options
 * @param {Object} options.conn
 * @param {Object} options.model
 * @param continueWith
 */
const up = function (options, continueWith) {
  const conn = options.conn;
  const Customer = conn.model('Customer', CustomerSchema);
  const customer = new Customer({
    name: 'PDMLab'
  });

  customer.save(err => {
    continueWith(err);
  });
};

module.exports = {
  up
};
