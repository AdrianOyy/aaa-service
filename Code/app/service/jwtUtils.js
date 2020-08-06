'use strict';

const jwt = require('jsonwebtoken');
module.exports = app => {

  return class extends app.Service {
    async getToken(content) {
      const token = jwt.sign(content, '1234567abc', { expiresIn: '10m' });
      return token;
    }
  };
};
