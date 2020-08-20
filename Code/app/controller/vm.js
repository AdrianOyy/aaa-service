'use strict';

module.exports = app => {
  return class extends app.Controller {

    async listApplicationType() {
      const { ctx } = this;

      const result = await ctx.model.models.vm_applicationType.findAll({});
      ctx.success(result);
    }

    async listCDC() {
      const { ctx } = this;

      const result = await ctx.model.models.vm_cdc.findAll({});
      ctx.success(result);
    }

    async listClusterApplicationType() {
      const { ctx } = this;
      const findParams = {
        include: [
          {
            model: ctx.model.models.vm_applicationType,
            as: 'applicationType',
            attributes: [ 'id', 'name' ],
          },
        ],
      };

      const result = await ctx.model.models.vm_cluster_applicationType.findAll(findParams);
      ctx.success(result);
    }

    async listPlatform() {
      const { ctx } = this;

      const result = await ctx.model.models.vm_platform.findAll({});
      ctx.success(result);
    }

    async listPlatformApplicationType() {
      const { ctx } = this;

      const findParams = {
        include: [
          {
            model: ctx.model.models.vm_platform,
            as: 'platform',
            attributes: [ 'id', 'name' ],
          },
          {
            model: ctx.model.models.vm_applicationType,
            as: 'applicationType',
            attributes: [ 'id', 'name' ],
          },
        ],
      };

      const result = await ctx.model.models.vm_platform_applicationType.findAll(findParams);
      ctx.success(result);
    }

    async listType() {
      const { ctx } = this;

      const result = await ctx.model.models.vm_type.findAll({});
      ctx.success(result);
    }

    async listTypeZoneCDC() {
      const { ctx } = this;

      const findParams = {
        include: [
          {
            model: ctx.model.models.vm_type,
            as: 'type',
            attributes: [ 'id', 'name' ],
          },
          {
            model: ctx.model.models.vm_cdc,
            as: 'cdc',
            attributes: [ 'id', 'name' ],
          },
          {
            model: ctx.model.models.vm_platform,
            as: 'platform',
            attributes: [ 'id', 'name' ],
          },
          {
            model: ctx.model.models.vm_zone,
            as: 'zone',
            attributes: [ 'id', 'name' ],
          },
        ],
      };

      const result = await ctx.model.models.vm_type_zone_cdc.findAll(findParams);
      ctx.success(result);
    }

    async listZone() {
      const { ctx } = this;

      const result = await ctx.model.models.vm_zone.findAll({});
      ctx.success(result);
    }
  };
};
