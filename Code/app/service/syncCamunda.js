'use strict';


module.exports = app => {
  const { rejectUnauthorized } = app.config.camunda;
  const flag = !(!rejectUnauthorized || rejectUnauthorized === 'N');
  return class extends app.Service {

    async startProcess(data, options) {
      const { ctx } = this;
      const url = app.config.camunda.url + '/process/startProcessTest';
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

