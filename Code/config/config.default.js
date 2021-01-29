'use strict';
const path = require('path');

module.exports = appInfo => {
  const config = exports;
  config.prefix = '';
  config.keys = appInfo.name + '_20200702134922';
  config.apiKey = 'f72cfe7c-df85-4123-beaf-ee9c34d8c1c0';

  config.logger = {
    dir: path.join(__dirname, '../logs'),
  };

  // ===================================
  //             ORM 设置
  // ===================================
  config.sequelize = {
    datasources: [
      {
        delegate: 'model',
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
      },
      {
        delegate: 'procedureModel',
        dialect: 'mysql', // support: mysql, mariadb, postgres, mssql
        database: 'nsr_gis_app',
        host: '10.231.131.123',
        port: '3306',
        username: 'admin',
        password: 'APJ@com123',
        logging: false,
        define: {
          freezeTableName: false,
          underscored: false,
        },
      },
    ],
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


  // ===================================
  //             内部服务 设置
  // ===================================
  config.activiti = {
    url: 'http://10.231.131.123:3004',
    rejectUnauthorized: 'N',
  };

  config.log = {
    tsHost: '127.0.0.1:3001',
  };


  // ===================================
  //             外部服务 设置
  // ===================================
  config.outbound = {
    url: 'http://10.231.131.123:8000',
  };

  config.adService = {
    prefix: '/adService',
    api: {
      auth: '/authenticate',
      findDisplayNames: '/findDisplayNames',
      userExistsMany: '/userExistsMany',
      findUser: '/findUser',
      findUsers: '/findUsers',
      findGroups: '/findGroups',
      getUsersForGroup: '/getUsersForGroup',
      findUsersByCn: '/findUsersByCn',
    },
  };

  config.cps = {
    prefix: '/CPS',
    api: {
      alladhoc: '/cps/alladhoc',
    },
  };

  config.cuid = {
    prefix: '/CUID',
    apiKey: '244575dc-0731-4340-a3a2-29f1d9f7104d',
    api: {
      getPublicKey: '/senseCuid/v1/getPublicKey',
    },
  };

  config.procedure = {
    fnName: 'sp_getLocationList',
  };

  // ===================================
  //           全局 中间件 设置
  // ===================================
  config.middleware = [ 'auth' ];
  config.auth = {
    ignore: [
      '/user/login',
      '/tenant/getCps',
      '/tenant/testCps',
      '/expiry/checkTenant',
      '/expiry/checkUser',
      '/vm/preDefine',
      '/test/error',
    ],
  };


  // ===================================
  //           JSON WEB TOKEN 设置
  // ===================================
  config.jwt = {
    expiresIn: '10m',
    secret: '1234567abc',
    iss: 'SENSEPLATFORM',
  };

  // ===================================
  //           其他 设置
  // ===================================
  config.loadUser = {
    loadFlag: 'N',
    cron: '0 0 23 * * *',
  };

  config.imap = {
    flag: 'N',
    fetchIndex: '1:*',
    namespace: null,
    interval: '60s',
    user: null,
    password: null,
    host: null,
    port: null,
  };


  config.mailGroup = {
    T1: 'IOS.ISMS',
    T2: 'IOS.ISMS',
    T6: 'IOS.ISMS',
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

  return config;
};
