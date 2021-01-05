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

  config.mailer = {
    host: 'smtp.mxhichina.com',
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'gitlab@apjcorp.com', // generated ethereal user
      pass: 'apj.com666', // generated ethereal password
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

  const outboundUrl = 'http://10.231.131.123:3010';

  config.adService = {
    url: outboundUrl + '',
  };

  config.activiti = {
    // url: 'http://localhost:8888',
    url: 'http://10.231.131.123:3004',
  };

  // ===================================
  //           全局 中间件 设置
  // ===================================
  config.middleware = [ 'log', 'auth' ];
  config.auth = {
    ignore: [ '/user/login', '/tenant/getCps', '/tenant/testCps' ],
  };
  config.log = {
    tsHost: '127.0.0.1:3001',
  };

  config.jwt = {
    expiresIn: '10m',
    secret: '1234567abc',
    iss: 'SENSEPLATFORM',
  };

  config.schedule = {
    interval: '60s',
  };

  const cron = process.env.npm_config_loadCron ? process.env.npm_config_loadCron : '0 0 23 * * *';
  config.loadUser = {
    cron,
  };

  return config;
};
