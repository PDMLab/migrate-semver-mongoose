# MongoDb migrations using mongoose and migrate-semver

`migrate-semver-mongoose` is plugin for [migrate-semver](https://github.com/PDMLab/migrate-semver) allowing you to do migrations based on [SemVer](http://semver.org/) and [mongoose](http://mongoosejs.com).

## Installation

```
npm install --save migrate-semver
npm install --save migrate-semver-mongoose
```

## Usage

`migrate-semver` just handles the heavy lifting of finding the viable migrations to run based on a SemVer compliant version string passed into it.
The parts specific to MongoDb / Mongoose are handled by `migrate-semver-mongoose`.

The following example runs a migration for version `0.3.0`.

```js
const SemVerMigration = require('migrate-semver');
const mongoosePlugin = require('migrate-semver-mongoose');

const migrationsDirectory = path.join(__dirname, 'migrations');
const migrateSemVer = new SemVerMigration({ migrationsDirectory }, mongoosePlugin());
const version = '0.3.0';

migrateSemVer.connect({ mongoServer: 'mongodb://localhost:27017/test' }, err => { 
  migrateSemVer.up({ version }, err => {
    console.log('done');
  });
});
```

`migrate-semver-mongoose` handles several scenarios for you based on the example above: 

* If your current database has no migrations at all (so it might be empty at all), `migrate-semver` runs all available migrations until `0.3.0` (including `0.3.0`).
* If your current database has version `0.2.0` applied and `0.3.0` is the next available migration, `0.3.0` is just applied.
* If your current database has version `0.1.0` applied and `0.2.0` is also available, both `0.2.0` and `0.3.0` wil be applied.

The scenarios described above can be found in the tests.

`migrate-semver-mongoose` allows you to specify the base directory which contains all your migration folders and files.
Just pass the `migrationsDirectory` option to the `SemVerMigration` ctor function as shown above.

The file and folder structure has to follow this convention (the `index-up.js` can be renamed if you implement your own plugin):

<pre>
- &lt;migrationsDirectory>    
  - 0.1.0
    - index-up.js
  - 0.2.0
    - index-up.js
  - 0.2.1
    - index-up.js
  - 0.3.0 
    - index-up.js
</pre>

The `index-up.js` could look like this:

```js
'use strict';
const CustomerSchema = require('./schemas/customer');

/**
 * @param {Object} options
 * @param {Object} options.conn
 * @param {Object} options.model
 * @param continueWith
 */
const up = function (options, callback) {
  const conn = options.conn;
  const Customer = conn.model('Customer', CustomerSchema);
  const customer = new Customer({
    name: 'PDMLab'
  });

  customer.save(err => {
    callback(err);
  });
};

module.exports = {
  up
};
```

As you can see, you get passed a `mongoose` connection instance so you don't mess with the `mongoose` default instance.

The default name of the collection where the applied migrations are stored is `migrations`. You can change it by passing a different name into the plugin ctor function:

```js
const customCollectionName = 'custom.migrations';
mongoosePlugin({ migrationsCollectionName: customCollectionName })
```
 
## Running the tests

The tests require Docker (version 1.10+) and Docker Compose (version 1.6.0+). Make sure you have installed both.

```
docker pull mongo:3.2.4
npm test
```

## Want to help?

This project is just getting off the ground and could use some help with cleaning things up and refactoring.

If you want to contribute - we'd love it! Just open an issue to work against so you get full credit for your fork. You can open the issue first so we can discuss and you can work your fork as we go along.

If you see a bug, please be so kind as to show how it's failing, and we'll do our best to get it fixed quickly.

Before sending a PR, please [create an issue](https://github.com/PDMLab/composefile/issues/new) to introduce your idea and have a reference for your PR.

Also please add tests and make sure to run `npm run eslint`.

## License

MIT License

Copyright (c) 2016 PDMLab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.