'use strict';
const CountrySchema = require('../0.2.0/schemas/country');

/**
 * @param {Object} options
 * @param {Object} options.conn
 * @param {Object} options.model
 * @param continueWith
 */
const up = function (options, continueWith) {
  const conn = options.conn;
  const Country = conn.model('Country', CountrySchema);
  const country = new Country({
    name: 'Italy'
  });

  country.save(err => {
    continueWith(err);
  });
};

module.exports = {
  up
};
