'use strict';

module.exports = app => {
  return class extends app.Controller {
    async updateStatus() {
      const { ctx } = this;
      const { status, idList, childFormKey, version } = ctx.request.body;
      if (!status || !idList || !idList.length) ctx.error();
      try {
        const idString = '(' + idList.join(',') + ')';
        const updateSql = `update ${childFormKey}${version} set status = '${status}' where id in ${idString}`;
        const [ updateResults ] = await app.model.query(updateSql);
        ctx.success({ result: true, affectedRows: updateResults.affectedRows });
      } catch (error) {
        ctx.logger.error(error);
        console.log('error=========================error');
        console.log(error);
        console.log('error=========================error');
        ctx.error('service busy');
      }
    }
    async checkStatus() {
      const { ctx } = this;
      const { idList } = ctx.request.body;
      if (!idList || !idList.length) ctx.error();
      try {
        const idString = '(' + idList.join(',') + ')';
        const checkSql = `select count(*) as number from VMList where status is not null and id in ${idString}`;
        const [ selectResults ] = await app.model.query(checkSql);
        const result = selectResults[0].number === 0;
        ctx.success(result);
      } catch (error) {
        ctx.logger.error(error);
        console.log('error==========================error');
        console.log(error.message);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }

    async defindVMType() {
      const { ctx } = this;
      const { zone_id, type_id, size } = ctx.request.body;
      if (!zone_id || !type_id || !size) ctx.error();
      try {
        const type = await ctx.service.defineVMType.defineVMType(zone_id, type_id, size);
        ctx.success({ type });
      } catch (error) {
        ctx.logger.error(error);
        console.log('error==========================error');
        console.log(error.message);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }
  };
};
