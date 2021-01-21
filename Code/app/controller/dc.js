'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      try {
        const list = await ctx.model.models.vm_cdc.findAll();
        ctx.success(list);
      } catch (err) {
        ctx.logger.error(err);
        console.log('err=========================err');
        console.log(err);
        console.log('err=========================err');
        ctx.error(err.message);
      }
    }
  };
};
