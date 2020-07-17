'use strict';
const path = require('path');

module.exports = appInfo => {
  const config = exports;

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

  return config;
};
