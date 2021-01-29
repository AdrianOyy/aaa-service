'use strict';

module.exports = app => {
  return class Common extends app.Service {
    getDateRangeCondition(dateRangeString) {
      if (!dateRangeString) return undefined;
      try {
        const { Op } = app.Sequelize;
        const dataRange = JSON.parse(dateRangeString);
        let c1,
          c2;
        if (dataRange && dataRange.startDate) {
          c1 = new Date(dataRange.startDate) - 0;
          c1 = c1 - c1 % 8.64e7;
        }
        if (dataRange && dataRange.endDate) {
          c2 = new Date(dataRange.endDate) - 0;
          c2 = c2 - c2 % 8.64e7;
        }
        if (c1 && c2 && (c1 - c2 > 0)) {
          const c = c1;
          c1 = c2;
          c2 = c;
        }
        const c = [];
        if (c1) {
          c.push({ [Op.gte]: new Date(c1) });
        }
        if (c2) {
          c.push({ [Op.lt]: new Date(c2 - (-8.64e7)) });
        }
        return c.length ? { [Op.and]: c } : undefined;
      } catch (e) {
        this.ctx.logger.error(e);
        console.log('e.message=========================e.message');
        console.log(e.message);
        console.log('e.message=========================e.message');
        return false;
      }
    }

    /**
     *
     * @param {String} url request path
     * @param {Object} [option] option
     * @param {String} [option.method='GET'] request method default GET
     * @param {Object} [option.headers] request headers
     * @param {Object} [option.data] request body
     * @param {Object} [option.params] request query string
     * @return {Promise<any>} result request result
     */
    async request(url, option) {
      const { ctx } = this;
      console.log('Request to ', url);
      const res = await ctx.curl(url,
        Object.assign(
          { method: option.method || 'GET' },
          option.headers ? { headers: option.headers } : undefined,
          option.data ? { data: option.data } : undefined,
          option.params ? { params: option.params } : undefined
        )
      );
      return JSON.parse(res.data);
    }

    checkApiKey() {
      return this.ctx.headers['x-apikey'] === app.config.apiKey;
    }
  };
};
