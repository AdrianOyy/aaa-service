'use strict';
const path = require('path');

exports.sequelize = {
  enable: true,
  package: 'egg-sequelize',
};

exports.cors = {
  enable: true,
  package: 'egg-cors',
};

exports.multipart = {
  enable: true,
  package: 'egg-multipart',
};

exports.base = {
  enable: true,
  path: path.join(__dirname, '../lib/plugin/egg-base'),
};
