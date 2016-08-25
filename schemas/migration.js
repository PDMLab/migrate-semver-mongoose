'use strict';
const mongoose = require('mongoose');

const Migration = new mongoose.Schema({
  version: {
    type: String,
    required: true
  },
  direction: {
    type: String,
    required: true
  },
  dateApplied: {
    type: Date,
    require: true
  }
});

module.exports = Migration;
