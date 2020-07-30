'use strict';

const axios = require('axios');

const url = 'http://10.231.131.123:3010/';
// const url = 'http://127.0.0.1:7002/';
const jwt = require('jsonwebtoken');
module.exports = app => {

  return class extends app.Service {
    async authenticate(username, password) {
      const axiosResult = await axios.post(url + 'adService/authenticate', { username, password }
      ).then(function(response) {
        return new Promise(resolve => {
          const data = response.data.data;
          const result = {};
          if (data.auth) {
            // result.user = data.user;
            const user = data.user;
            const groups = data.groups;
            result.user = user;
            result.groups = groups;
            const token = jwt.sign({
              username: user.sAMAccountName,
            }, '1234567abc', { expiresIn: '10m' });
            result.token = token;
            resolve(result);
          } else {
            resolve(false);
          }
        });
      }).catch(function(error) {
        console.log(error);
        return new Promise(resolve => {
          resolve(null);
        });
      });
      return axiosResult;
    }
  };
};
