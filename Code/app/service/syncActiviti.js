'use strict';


module.exports = app => {
  const { rejectUnauthorized } = app.config.activiti;
  const flag = !(!rejectUnauthorized || rejectUnauthorized === 'N');
  return class extends app.Service {
    async loadUser(user, options) {
      const { ctx } = this;
      const url = app.config.activiti.url + '/user/loadUser';
      options.data = user;
      const result = await this.curl(url, options, ctx);
      return result.data;
    }

    async getEmailFolder(data, options) {
      const { ctx } = this;
      const url = app.config.activiti.url + '/email/getEmailFolder';
      options.data = data;
      const result = await this.curl(url, options, ctx);
      return result.data;
    }

    async actionTask(data, options) {
      const { ctx } = this;
      const url = app.config.activiti.url + '/runtime/actionTask';
      options.data = data;
      const result = await this.curl(url, options, ctx);
      return result.data;
    }

    async deleteGroup(groupIds, headers) {
      const { ctx } = this;
      const url = app.config.activiti.url + '/user/deleteGroup';
      const result = await this.curl(url, { headers, data: groupIds, method: 'DELETE' }, ctx);
      return result.data;
    }

    async saveOrUpdateGroup(group, options) {
      const { ctx } = this;
      const url = app.config.activiti.url + '/user/saveOrUpdateGroup';
      options.data = group;
      const result = await this.curl(url, options, ctx);
      return result.data;
    }

    async startProcess(data, options) {
      const { ctx } = this;
      const url = app.config.activiti.url + '/process/startProcess';
      options.data = data;
      let res;
      try {
        res = await this.curl(url, options, ctx);
      } catch (e) {
        throw new Error(e.message);
      }
      const { pid, error } = res.data.data;
      return {
        pid,
        error,
      };
    }

    async sendTaskEmail(data, options) {
      const { ctx } = this;
      const url = app.config.activiti.url + '/runtime/sendTaskEmail';
      options.data = data;
      const result = await this.curl(url, options, ctx);
      return result.data;
    }

    async getUsersByEmails(data, options) {
      const { ctx } = this;
      const url = app.config.activiti.url + '/user/getUsers';
      options.data = data;
      const result = await this.curl(url, options, ctx);
      return result.data;
    }

    /**
     * curl方法
     * @param {*} url 必填
     * @param {*} options { headers（可选）, data（可选）, method(默认为'POST'), contentType(默认为'json'), dataType(默认为'json') }
     * @param {*} ctx 必填
     */
    async curl(url, options, ctx) {
      const curl = Object.assign(
        {
          method: options.method ? options.method : 'POST',
          contentType: options.contentType ? options.contentType : 'json',
          dataType: options.dataType ? options.dataType : 'json',
          timeout: options.timeout ? options.timeout : 60 * 1000,
          rejectUnauthorized: flag,
        },
        options.data ? { data: options.data } : undefined,
        options.headers ? { headers: options.headers } : undefined
      );
      console.log(new Date(), 'curl: url', url);
      const result = await ctx.curl(url,
        curl
      );
      return result;
    }
  };
};

