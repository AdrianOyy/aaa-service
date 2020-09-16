'use strict';

module.exports = app => {
  return class extends app.Controller {
    // async list() {
    // }

    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) {
        ctx.success();
        return;
      }
      const inventory = await ctx.model.models.inventory.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ctx.model.models.inventoryStatus,
            as: 'status',
          },
          {
            model: ctx.model.models.equipmentPort,
            as: 'equipPort',
            include: {
              model: ctx.model.models.portAssignment,
              as: 'portAssignment',
            },
          },
        ],
      });
      ctx.success(inventory);
    }

    // async update() {
    //
    // }
    //
    // async delete() {
    //
    // }
    //
    // async deleteMayn() {
    //
    // }
  };
 };
