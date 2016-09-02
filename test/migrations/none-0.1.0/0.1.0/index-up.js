'use strict';
const CustomerSchema = require('./schemas/customer');

/**
 * @param {Object} options
 * @param {Object} options.conn
 * @param {Object} options.model
 * @param {Object} [options.customOptions]
 * @param continueWith
 */
const up = function (options, continueWith) {
  let name = 'PDMLab';

  if (options.customOptions) {
    name = options.customOptions.customName;
  }
  const conn = options.conn;
  const Customer = conn.model('Customer', CustomerSchema);
  const customer = new Customer({ name });

  customer.save(err => {
    continueWith(err);
  });
};

module.exports = {
  up
};
