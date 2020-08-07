'use strict';

const jwt = require('jsonwebtoken');
module.exports = app => {

  return class extends app.Service {
    getToken(options) {
      const config = app.config.jwt;
      const { content, expiresIn } = options;
      const token = jwt.sign(content, config.secret, { expiresIn: expiresIn ? expiresIn : config.expiresIn });
      return token;
    }
  };
};
