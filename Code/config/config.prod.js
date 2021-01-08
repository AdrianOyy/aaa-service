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
    datasources: [
      {
        delegate: 'model',
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
      },
      {
        delegate: 'procedureModel',
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
      },
    ],
  };

  config.mailer = {
    host: process.env.npm_config_mailHost,
    port: process.env.npm_config_mailPort,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.npm_config_mailUser, // generated ethereal user
      pass: process.env.npm_config_mailPass, // generated ethereal password
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
  const outboundUrl = process.env.npm_config_outboundUrl;

  config.adService = {
    url: outboundUrl + '/adService',
  };

  config.procedure = {
    fnName: process.env.npm_config_procedureFn,
  };


  config.activiti = {
    url: process.env.npm_config_activitiUrl,
  };

  // ===================================
  //           全局 中间件 设置
  // ===================================
  config.middleware = [ 'log', 'auth' ];
  config.auth = {
    ignore: [ '/user/login', '/tenant/getCps', '/tenant/testCps' ],
  };
  config.log = {
    tsHost: process.env.npm_config_transitionHost,
  };

  config.jwt = {
    expiresIn: process.env.npm_config_jwtExpiresIn,
    secret: process.env.npm_config_jwtSecret,
    iss: process.env.npm_config_jwtIss,
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
