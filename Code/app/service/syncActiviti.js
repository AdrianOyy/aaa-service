'use strict';

const axios = require('axios');

module.exports = app => {
  return class extends app.Service {
    async loadUser(user, options) {
      const { ctx } = this;
      const url = app.config.activiti.url + '/user/loadUser';
      options.data = user;
      const result = await curl(url, options, ctx);
      return result.data;
    }

    async getEmailFolder(data, options) {
      const { ctx } = this;
      const url = app.config.activiti.url + '/email/getEmailFolder';
      options.data = data;
      const result = await curl(url, options, ctx);
      return result.data;
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
          console.log(error.message);
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
          console.log(error.message);
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
        console.log(error.message);
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
        console.log(error.message);
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
        console.log(error.message);
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
          console.log(error.message);
        });
      return auth;
    }
  };
};

async function curl(url, options, ctx) {
  const result = await ctx.curl(url,
    {
      method: options.method ? options.method : 'POST',
      headers: options.headers,
      contentType: options.contentType ? options.contentType : 'json',
      data: options.data,
      dataType: options.dataType ? options.dataType : 'json',
    }
  );
  return result;
}
