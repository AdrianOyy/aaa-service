'use strict';

const axios = require('axios');

// const url = 'http://10.231.131.123:3010/';
const url = 'http://localhost:8888/';
// const url = 'http://10.231.131.123:8000/workflow';
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

    async loadUser(user, options) {
      const auth = await axios.post(url + 'user/loadUser', user, options
      ).then(function(response) {
        // console.log(response);
        return new Promise(resolve => {
          resolve(response.data);
        });
      }).catch(function(error) {
        console.log(error);
      });
      return auth;
    }

    async deleteGroup(groupIds, headers) {
      const auth = await axios.delete(url + 'user/deleteGroup', { data: groupIds, headers }
      ).then(function(response) {
        // console.log(response);
        return new Promise(resolve => {
          resolve(response.data);
        });
      }).catch(function(error) {
        console.log(error);
      });
      return auth;
    }

    async saveOrUpdateGroup(group) {
      const auth = await axios.post(url + 'user/saveOrUpdateGroup', group
      ).then(function(response) {
        return new Promise(resolve => {
          resolve(response.data);
        });
      }).catch(function(error) {
        console.log(error);
      });
      return auth;
    }
  };
};

