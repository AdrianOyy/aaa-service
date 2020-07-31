'use strict';

const axios = require('axios');

// const url = 'http://10.231.131.123:3010/';
const url = 'http://localhost:8888/';
module.exports = app => {
  return class extends app.Service {
    async syncUser() {
      const auth = await axios.post(url + 'user/createUser', { userId: '2', userName: 'tom2' }
      ).then(function(response) {
        console.log(response);
      }).catch(function(error) {
        console.log(error);
      });
      return auth;
    }

    async loadUser(user) {
      const auth = await axios.post(url + 'user/loadUser', user
      ).then(function(response) {
        console.log(response);
      }).catch(function(error) {
        console.log(error);
      });
      return auth;
    }
  };
};

