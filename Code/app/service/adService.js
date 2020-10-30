'use strict';

const axios = require('axios');

module.exports = app => {

  return class extends app.Service {
    async authenticate(username, password) {
      const app = this;
      const config = app.config.adService;
      const url = `${config.url}/authenticate`;
      const axiosResult = await axios.post(url, { username, password }
      ).then(function(response) {
        return new Promise(resolve => {
          const data = response.data.data;
          const result = {};
          if (data.auth) {
            const user = data.user;
            const groups = data.groups;
            result.user = user;
            result.groups = groups;
            const options = { content: { username: user.sAMAccountName }, expiresIn: '1440m' };
            const token = app.service.jwtUtils.getToken(options);
            result.token = token;
            resolve(result);
          } else {
            resolve(false);
          }
        });
      }).catch(function(error) {
        console.log(error.message);
        return new Promise(resolve => {
          resolve(null);
        });
      });
      return axiosResult;
    }
    async userExistsMany(usernames) {
      const app = this;
      const config = app.config.adService;
      const url = `${config.url}/userExistsMany`;
      const axiosResult = await axios.post(url, { usernames }
      ).then(function(response) {
        return new Promise(resolve => {
          const data = response.data.data;
          resolve(data);
        });
      }).catch(function(error) {
        console.log(error.message);
        return new Promise(resolve => {
          resolve(null);
        });
      });
      return axiosResult;
    }
    async findUser(username) {
      const app = this;
      const config = app.config.adService;
      const url = `${config.url}/findUser`;
      const axiosResult = await axios.get(url + '?username=' + username).then(function(response) {
        return new Promise(resolve => {
          const data = response.data.data;
          resolve(data);
        });
      }).catch(function(error) {
        console.log(error.message);
        return new Promise(resolve => {
          resolve(null);
        });
      });
      return axiosResult;
    }
    async findUsers(email) {
      const app = this;
      const config = app.config.adService;
      const url = `${config.url}/findUsers`;
      const axiosResult = await axios.get(url + '?email=' + email).then(function(response) {
        return new Promise(resolve => {
          const data = response.data.data;
          resolve(data);
        });
      }).catch(function(error) {
        console.log(error);
        return new Promise(resolve => {
          resolve(null);
        });
      });
      return axiosResult;
    }
    async findGroups(groupName) {
      const app = this;
      const config = app.config.adService;
      const url = `${config.url}/findGroups`;
      const axiosResult = await axios.get(url + '?groupName=' + groupName).then(function(response) {
        return new Promise(resolve => {
          const data = response.data.data;
          resolve(data);
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
