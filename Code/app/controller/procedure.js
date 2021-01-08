'use strict';

module.exports = app => {
  return class extends app.Controller {
    async call() {
      const { ctx } = this;
      const { arg } = ctx.query;
      const fnName = app.config.procedure.fnName || '';
      try {
        const res = await ctx.procedureModel.query(`call ${fnName}("${arg}")`);
        ctx.success(res);
      } catch (e) {
        console.log(e.message);
        ctx.error();
      }
    }
  };
};
