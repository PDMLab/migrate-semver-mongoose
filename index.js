'use strict';
const compareVersions = require('compare-versions');
const moment = require('moment');
const mongoose = require('mongoose');
const Migration = require('./schemas/migration');
const path = require('path');
const retry = require('retry');

let MigrationModel;
const config = {
  migrationsCollectionName: 'migrations'
};
let conn;

mongoose.Promise = global.Promise;

/**
 *
 * @param {Object} [pluginOptions]
 * @param {String} [pluginOptions.migrationsCollectionName]
 * @returns {{connect: connect, hasMigrationsTable: hasMigrationsTable, createMigrationsTable: createMigrationsTable, hasMigration: hasMigration, getLatestAppliedMigration: getLatestAppliedMigration, addMigrationToMigrationsTable: addMigrationToMigrationsTable, up: up}}
 */
const mongoosePlugin = function (pluginOptions) {
  if (pluginOptions && pluginOptions.migrationsCollectionName) {
    config.migrationsCollectionName = pluginOptions.migrationsCollectionName;
  }

  const connect = function (options, continueWith) {
    config.mongoServer = options.mongoServer;
    const operation = retry.operation();

    operation.attempt(() => conn = mongoose.createConnection(config.mongoServer, err => { // eslint-disable-line no-return-assign
      if (operation.retry(err)) {
        return;
      }

      return continueWith(err ? operation.mainError() : null);
    }));
  };

  /**
   * @param {Object} options
   * @param continueWith
   */
  const hasMigrationsTable = function (options, continueWith) {
    const abortWith = continueWith;

    MigrationModel = conn.model(config.migrationsCollectionName, Migration);

    conn.db.listCollections({ name: config.migrationsCollectionName }).next((err, collinfo) => {
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

  const getLatestAppliedMigration = function (continueWith) {
    const abortWith = continueWith;

    MigrationModel.find({}, (err, migrations) => {
      if (err) {
        return abortWith(err);
      }
      const sortedVersions = migrations.map(migration => migration.version).sort(compareVersions);
      const latestMigration = sortedVersions[sortedVersions.length - 1];

      return continueWith(null, latestMigration);
    });
  };

  const addMigrationToMigrationsTable = function (options, continueWith) {
    const migration = new MigrationModel({
      version: options.version,
      direction: options.direction,
      dateApplied: moment.utc()
    });

    migration.save(err => {
      continueWith(err);
    });
  };

  const up = function (options, continueWith) {
    const migrationsDirectory = options.migrationsDirectory;
    const migrationPath = path.join(migrationsDirectory, options.version, 'index-up');
    const migration = require(migrationPath); // eslint-disable-line

    migration.up({ conn, model: MigrationModel, customOptions: options.customOptions }, continueWith);
  };

  return {
    connect,
    hasMigrationsTable,
    createMigrationsTable,
    hasMigration,
    getLatestAppliedMigration,
    addMigrationToMigrationsTable,
    up
  };
};

module.exports = mongoosePlugin;
