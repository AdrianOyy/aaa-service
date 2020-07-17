'use strict';

module.exports = app => {
  return class extends app.Controller {

    async list() {
      const { ctx } = this;
      const result = await ctx.model.models.workflow.findAndCountAll({});
      ctx.success(result);
    }

    async create() {
      const { ctx } = this;
      const { name, remark } = ctx.request.body;
      const model = {
        name,
        remark,
      };
      await this.models.workflow.create(model);
      ctx.success();
    }

    async delete() {
      const { ctx } = this;
      const { idList } = ctx.request.body;
      const { Op } = app.Sequelize;
      await this.models.workflow.delete({
        where: {
          id: { [Op.in]: idList },
        },
      });
      ctx.success();
    }

    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { newInfo } = ctx.request.body;
      const entity = await this.models.workflow.findByPk(id);
      if (!entity) {
        ctx.error();
      } else {
        await entity.update(newInfo);
        ctx.success();
      }
    }

    async upload() {
      const { ctx } = this;
      const { fileList } = ctx.request.body;
      console.log('fileList==========================fileList');
      console.log(fileList);
      console.log('fileList==========================fileList');
      const saveFileList = [];
      fileList.forEach(el => {
        const model = {
          fileName: el.filename,
          savedName: el.savedName,
          savedDir: el.savedDir,
        };
        saveFileList.push(model);
      });
      console.log('saveFileList==========================saveFileList');
      console.log(saveFileList);
      console.log('saveFileList==========================saveFileList');
      ctx.success(saveFileList);
    }
  };
};
