const { DataSource } = require('typeorm');
const config = require('config');
const { createConnectionOptions } = require('./src/DAL/utils/createConnection');

/**
 * @type {import("./src/db/types").DbConfig}
 */
const connectionOptions = config.get('typeOrm');

const appDataSource = new DataSource({
  ...createConnectionOptions(connectionOptions),
});

module.exports = { appDataSource };
