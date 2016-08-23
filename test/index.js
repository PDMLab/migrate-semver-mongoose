'use strict';
const assert = require('assert');
const async = require('async');
const compose = require('./helper/compose');
const CustomerSchema = require('./migrations/none-0.1.0/0.1.0/schemas/customer');
const Migration = require('../schemas/migration');
const mongoose = require('mongoose');
const mongoosePlugin = require('../');
const path = require('path');
const SemVerMigration = require('migrate-semver');

describe('Migrations', () => {
  beforeEach(done => {
    async.series([
      awaits => {
        compose.kill({ cwd: __dirname }, awaits);
      },
      awaits => {
        compose.rm({ cwd: __dirname }, awaits);
      },
      awaits => {
        compose.up({ cwd: __dirname }, awaits);
      }
    ], err => {
      done(err);
    });
  });

  describe('When connecting to a db via plugin', () => {
    it('should call connect via plugin', done => {
      const migrateSemVer = new SemVerMigration({}, mongoosePlugin());

      migrateSemVer.connect({ mongoServer: 'mongodb://localhost:27000/test' }, err => {
        assert.equal(null, err);
        done();
      });
    });
  });

  describe('When running migration from no collections to 0.1.0 with no migrations collection existing', () => {
    it('should contain migration in migrations collection', done => {
      const version = '0.1.0';
      const migrationsDirectory = path.join(__dirname, 'migrations', 'none-0.1.0');
      const migrateSemVer = new SemVerMigration({ migrationsDirectory }, mongoosePlugin());

      migrateSemVer.connect({ mongoServer: 'mongodb://localhost:27000/test' }, err => { // eslint-disable-line
        migrateSemVer.up({ version }, err => { // eslint-disable-line
          const conn = mongoose.createConnection('mongodb://localhost:27000/test', err => { // eslint-disable-line
            const MigrationModel = conn.model('Migration', Migration);

            MigrationModel.findOne({ version: '0.1.0', direction: 'up' }, (err, migration) => { // eslint-disable-line
              assert.notEqual(null, migration);
              done();
            });
          });
        });
      });
    });

    it('should create 1 customer in customer collection', done => {
      const version = '0.1.0';
      const migrationsDirectory = path.join(__dirname, 'migrations', 'none-0.1.0');
      const migrateSemVer = new SemVerMigration({ migrationsDirectory }, mongoosePlugin());

      migrateSemVer.connect({ mongoServer: 'mongodb://localhost:27000/test' }, err => { // eslint-disable-line
        migrateSemVer.up({ version }, err => { // eslint-disable-line
          const conn = mongoose.createConnection('mongodb://localhost:27000/test', err => { // eslint-disable-line
            const Customer = conn.model('Customer', CustomerSchema);

            Customer.findOne({ name: 'PDMLab' }, (err, customer) => { // eslint-disable-line
              assert.notEqual(null, customer);
              done();
            });
          });
        });
      });
    });
  });
});
