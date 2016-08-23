'use strict';
const exec = require('child_process').exec;

const up = function (options, continueWith) {
  exec('docker-compose up -d', { cwd: options.cwd }, (err, stdout, stderr) => {
    if (err) {
      return continueWith(err);
    }

    return continueWith(null, stderr);
  });
};

const kill = function (options, continueWith) {
  exec('docker-compose kill', { cwd: options.cwd }, (err, stdout, stderr) => {
    if (err) {
      return continueWith(err);
    }

    return continueWith(null, stderr);
  });
};

const rm = function (options, continueWith) {
  exec('docker-compose rm -f', { cwd: options.cwd }, (err, stdout, stderr) => {
    if (err) {
      return continueWith(err);
    }

    return continueWith(null, stderr);
  });
};

module.exports = {
  up,
  kill,
  rm
};
