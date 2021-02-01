'use strict';
const path = require('path');

module.exports = appInfo => {
  const config = exports;
  config.prefix = '';
  config.keys = appInfo.name + '_20200702134922';
  config.apiKey = process.env.npm_config_apiKey || 'f72cfe7c-df85-4123-beaf-ee9c34d8c1c0';

  // ===================================
  //             ORM 设置
  // ===================================
  config.sequelize = {
    datasources: [
      {
        delegate: 'model',
        dialect: process.env.npm_config_dbType,
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
        dialect: process.env.npm_config_procedureDBType || process.env.npm_config_dbType,
        database: process.env.npm_config_procedureDBName,
        host: process.env.npm_config_procedureDBHost || process.env.npm_config_dbHost,
        port: process.env.npm_config_procedureDBPort || process.env.npm_config_dbPort,
        username: process.env.npm_config_procedureDBUser || process.env.npm_config_dbUser,
        password: process.env.npm_config_procedureDBPassword || process.env.npm_config_dbPassword,
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
    url: process.env.npm_config_activitiUrl,
    rejectUnauthorized: process.env.npm_config_rejectUnauthorized || 'N',
  };

  config.log = {
    tsHost: process.env.npm_config_transitionHost,
  };


  // ===================================
  //             外部服务 设置
  // ===================================
  config.outbound = {
    url: process.env.npm_config_outboundUrl,
  };

  config.adService = {
    prefix: process.env.npm_config_adPrefix,
    api: {
      auth: process.env.npm_config_authAPI || '/authenticate',
      findDisplayNames: process.env.npm_config_findDisplayNameAPI || '/findDisplayNames',
      userExistsMany: process.env.npm_config_userExistsManyAPI || '/userExistsMany',
      findUser: process.env.npm_config_findUserAPI || '/findUser',
      findUsers: process.env.npm_config_findUsersAPI || '/findUsers',
      findGroups: process.env.npm_config_findGroupsAPI || '/findGroups',
      getUsersForGroup: process.env.npm_config_getGusrsForGourpAPI || '/getUsersForGroup',
      findUsersByCn: process.env.npm_config_findUsersByCnAPI || '/findUsersByCn',
    },
  };

  config.cps = {
    prefix: process.env.npm_config_cpsPrefix,
    api: {
      alladhoc: process.env.npm_config_alladhocAPI || '/cps/alladhoc',
    },
  };

  config.cuid = {
    prefix: process.env.npm_config_CUIDPrefix,
    apiKey: process.env.npm_config_CUIDAPIKey,
    api: {
      getPublicKey: process.env.npm_config_getPublicKeyAPI || '/senseCuid/v1/getPublicKey',
    },
  };

  config.procedure = {
    fnName: process.env.npm_config_procedureFn,
  };


  // ===================================
  //           全局 中间件 设置
  // ===================================
  config.middleware = [ 'log', 'errorLog', 'auth' ];
  config.auth = {
    ignore: [
      '/user/login',
      '/tenant/getCps',
      '/tenant/testCps',
      '/diyForm/list',
    ],
  };


  // ===================================
  //           JSON WEB TOKEN 设置
  // ===================================
  config.jwt = {
    expiresIn: process.env.npm_config_jwtExpiresIn,
    secret: process.env.npm_config_jwtSecret,
    iss: process.env.npm_config_jwtIss,
  };

  config.mailGroup = {
    T1: process.env.npm_config_t1,
    T2: process.env.npm_config_t2,
    T6: process.env.npm_config_t6,
    Lint: process.env.npm_config_frontEndUrl,
  };


  // ===================================
  //           其他 设置
  // ===================================
  config.loadUser = {
    loadFlag: process.env.npm_config_loadFlag || 'N',
    cron: process.env.npm_config_loadCron || '0 0 23 * * *',
  };

  config.imap = {
    flag: process.env.npm_config_imapFlag || 'N',
    fetchIndex: process.env.npm_config_imapFetchIndex || '1:*',
    namespace: process.env.npm_config_imapNamespace || null,
    interval: process.env.npm_config_imapInterval || '60s',
    user: process.env.npm_config_imapUser,
    password: process.env.npm_config_imapPass,
    host: process.env.npm_config_imapHost,
    port: process.env.npm_config_imapPort,
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

  return config;
};
