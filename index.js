'use strict';
const mongoose = require('mongoose');
const Migration = require('./schemas/migration');
const path = require('path');
const retry = require('retry');

let MigrationModel;
const config = {};
let conn;

mongoose.Promise = global.Promise;
const mongoosePlugin = function () {
  const connect = function (options, continueWith) {
    config.mongoServer = options.mongoServer;
    const operation = retry.operation();

    operation.attempt(() => conn = mongoose.createConnection(config.mongoServer, err => { // eslint-disable-line no-return-assign
      if (operation.retry(err)) {
        return;
      }

      MigrationModel = conn.model('Migration', Migration);

      return continueWith(err ? operation.mainError() : null);
    }));
  };

  const hasMigrationsTable = function (options, continueWith) {
    const abortWith = continueWith;

    conn.db.listCollections({ name: 'migrations' }).next((err, collinfo) => {
      if (err) {
        return abortWith(err);
      }

      return continueWith(null, collinfo !== null);
    });
  };

  const createMigrationsTable = function (options, continueWith) {
    continueWith();
  };

  const hasMigration = function (options, continueWith) {
    MigrationModel.findOne({ version: options.version, direction: options.direction }, (err, migration) => {
      continueWith(err, migration !== null);
    });
  };

  const addMigrationToMigrationsTable = function (options, continueWith) {
    const migration = new MigrationModel({
      version: options.version,
      direction: options.direction
    });

    migration.save(err => {
      continueWith(err);
    });
  };

  const up = function (options, continueWith) {
    const migrationsDirectory = options.migrationsDirectory;
    const migrationPath = path.join(migrationsDirectory, options.version, 'index-up');
    const migration = require(migrationPath); // eslint-disable-line

    migration.up({ conn, model: MigrationModel }, continueWith);
  };

  return {
    connect, hasMigrationsTable, createMigrationsTable, hasMigration, addMigrationToMigrationsTable, up
  };
};

module.exports = mongoosePlugin;
