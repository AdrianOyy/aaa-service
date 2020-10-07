'use strict';

const axios = require('axios');

module.exports = app => {
  return class extends app.Service {
    async loadUser(user, options) {
      const url = app.config.activiti.url;
      const auth = await axios
        .post(url + '/user/loadUser', user, options)
        .then(function(response) {
          return new Promise(resolve => {
            resolve(response.data);
          });
        }).catch(function(error) {
          console.log(error);
        });
      return auth;
    }

    async actionTask(data, options) {
      const url = app.config.activiti.url;
      const auth = await axios
        .post(url + '/runtime/actionTask', data, options)
        .then(function(response) {
          return new Promise(resolve => {
            resolve(response.data);
          });
        }).catch(function(error) {
          console.log(error);
        });
      return auth;
    }

    async deleteGroup(groupIds, headers) {
      const url = app.config.activiti.url;
      const auth = await axios
        .delete(url + '/user/deleteGroup', { headers, data: groupIds })
        .then(function(response) {
          return new Promise(resolve => {
            resolve(response.data);
          });
        }).catch(function(error) {
          console.log(error);
        });
      return auth;
    }

    async saveOrUpdateGroup(group, options) {
      const url = app.config.activiti.url;
      const auth = await axios.post(url + '/user/saveOrUpdateGroup', group, options
      ).then(function(response) {
        return new Promise(resolve => {
          resolve(response.data);
        });
      }).catch(function(error) {
        console.log(error);
      });
      return auth;
    }

    async startProcess(data, options) {
      const url = app.config.activiti.url;
      const auth = await axios.post(url + '/process/startProcess', data, options
      ).then(function(response) {
        return new Promise(resolve => {
          resolve(response.data);
        });
      }).catch(function(error) {
        console.log(error);
      });
      return auth;
    }
    async sendTaskEmail(data, options) {
      const url = app.config.activiti.url;
      const result = await axios.post(url + '/runtime/sendTaskEmail', data, options
      ).then(function(response) {
        return new Promise(resolve => {
          resolve(response.data);
        });
      }).catch(function(error) {
        console.log(error);
      });
      return result;
    }
    async getUsersByEmails(data, options) {
      const url = app.config.activiti.url;
      const auth = await axios
        .post(url + '/user/getUsers', data, options)
        .then(function(response) {
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

