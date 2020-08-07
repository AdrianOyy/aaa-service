'use strict';
const path = require('path');

module.exports = appInfo => {
  const config = exports;
  config.prefix = '';
  config.keys = appInfo.name + '_20200702134922';

  // ===================================
  //             ORM 设置
  // ===================================
  config.sequelize = {
    dialect: 'mysql', // support: mysql, mariadb, postgres, mssql
    database: 'aaa_service',
    host: '10.231.131.123',
    port: '3306',
    username: 'admin',
    password: 'APJ@com123',
    logging: false,
    define: {
      freezeTableName: false,
      underscored: false,
    },
  };

  // ===================================
  //             上传文件 设置
  // ===================================
  config.multipart = {
    fileSize: '5mb',
    whitelist: [
      '.xlsx',
      '.docx',
      '.csv',
    ],
  };

  config.upload = {
    baseDir: path.join(__dirname, '../upload_files'),
    bucket: 'gen',
  };

  // ===================================
  //             跨域 设置
  // ===================================
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  // ===================================
  //             安全 设置
  // ===================================
  config.security = {
    csrf: {
      enable: false,
    },
  };
  config.adService = {
    url: 'http://10.231.131.123:3010',
    // url: 'http://127.0.0.1:7002',
  };

  config.activiti = {
    url: 'http://10.231.131.123:8000/workflow',
    // url: 'http://localhost:8888',
  };

  config.jwt = {
    expiresIn: '10m',
    secret: '1234567abc',
  };

  return config;
};
