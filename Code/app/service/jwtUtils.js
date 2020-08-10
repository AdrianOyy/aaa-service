'use strict';

const jwt = require('jsonwebtoken');
module.exports = app => {

  return class extends app.Service {
    getToken(options) {
      const config = app.config.jwt;
      const { content, expiresIn } = options;
      const payLoad = Object.assign(
        content,
        { key: config.key }
      );
      console.log(payLoad);
      const token = jwt.sign(payLoad, config.secret, { expiresIn: expiresIn ? expiresIn : config.expiresIn });
      return token;
    }
  };
};
