'use strict';

module.exports = app => {
  return class extends app.Controller {
    async updateStatus() {
      const { ctx } = this;
      const { type, idList } = ctx.request.body;
      if (!type || !idList || !idList.length) ctx.error();
      try {
        const idString = '(' + idList.join(',') + ')';
        const checkSql = `select count(*) as number from vmlist where status is not null and id in ${idString}`;
        const [ selectResults ] = await app.model.query(checkSql);
        if (selectResults[0].number === 0) {
          const updateSql = `update vmlist set status = '${type}' where id in ${idString}`;
          const [ updateResults ] = await app.model.query(updateSql);
          console.log(updateResults.affectedRows);
          ctx.success({ result: true, affectedRows: updateResults.affectedRows });
        } else {
          ctx.success({ result: false });
        }
      } catch (error) {
        console.log('error==========================error');
        console.log(error);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }
  };
};
