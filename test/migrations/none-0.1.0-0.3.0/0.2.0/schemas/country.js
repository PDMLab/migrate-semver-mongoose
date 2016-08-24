'use strict';
const mongoose = require('mongoose');

const Country = new mongoose.Schema({
  name: String
});

module.exports = Country;
