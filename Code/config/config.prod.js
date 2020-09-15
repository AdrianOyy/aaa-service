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
    dialect: process.env.npm_config_dbType, // support: mysql, mariadb, postgres, mssql
    database: process.env.npm_config_dbName,
    host: process.env.npm_config_dbHost,
    port: process.env.npm_config_dbPort,
    username: process.env.npm_config_dbUser,
    password: process.env.npm_config_dbPassword,
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
    url: process.env.npm_config_adServiceUrl,
  };

  config.activiti = {
    url: process.env.npm_config_activitiUrl,
  };

  // ===================================
  //           全局 中间件 设置
  // ===================================
  config.middleware = [ 'auth' ];
  config.auth = {
    ignore: [ '/user/login' ],
  };

  config.jwt = {
    expiresIn: process.env.npm_config_jwtExpiresIn,
    secret: process.env.npm_config_jwtSecret,
    iss: process.env.npm_config_jwtIss,
  };

  return config;
};
