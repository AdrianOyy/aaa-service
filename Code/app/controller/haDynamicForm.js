'use strict';

module.exports = app => {
  return class extends app.Controller {
    async getInitData() {
      const { ctx } = this;
      const { pid, deploymentId } = ctx.query;
      if (!pid) {
        ctx.error();
        return;
      }
      const dynamicForm = await ctx.model.models.dynamicForm.findOne({ where: { deploymentId, parentId: null } });
      const childForm = await ctx.model.models.dynamicForm.findOne({ where: { parentId: dynamicForm.id } });
      const detail = await ctx.service.diyForm.getDIYFormDetail(pid, dynamicForm.formKey, childForm ? childForm.formKey : null, dynamicForm.version);
      ctx.success(detail);
    }
  };
};
