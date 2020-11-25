'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { name, code, manager_group_id, supporter_group_id, group_id,
        justification, budget_type, project_owner,
        contact_person, project_estimation, methodology_text,
        createdAt, updatedAt, prop, order } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'createdAt', 'desc' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.tenant.findAndCountAll({
          where: Object.assign(
            {},
            name ? { name: { [Op.like]: `%${name}%` } } : undefined,
            code ? { code: { [Op.like]: `%${code}%` } } : undefined,
            manager_group_id ? { manager_group_id } : undefined,
            supporter_group_id ? { supporter_group_id } : undefined,
            group_id ? { group_id } : undefined,
            justification ? { justification } : justification,
            budget_type ? { budget_type } : budget_type,
            project_owner ? { project_owner } : project_owner,
            contact_person ? { contact_person } : contact_person,
            project_estimation ? { project_estimation } : project_estimation,
            methodology_text ? { methodology_text } : methodology_text,
            createdAt ? { createdAt: { [Op.and]: [{ [Op.gte]: new Date(createdAt) }, { [Op.lt]: new Date(new Date(createdAt) - (-8.64e7)) }] } } : undefined,
            updatedAt ? { updatedAt: { [Op.and]: [{ [Op.gte]: new Date(updatedAt) }, { [Op.lt]: new Date(new Date(updatedAt) - (-8.64e7)) }] } } : undefined
          ),
          include: [
            {
              model: ctx.model.models.ad_group,
              as: 'manager_group',
              required: true,
            },
            {
              model: ctx.model.models.ad_group,
              as: 'supporter_group',
              required: true,
            },
          ],
          order: Order,
          offset,
          limit,
        });
        ctx.success(res);
      } catch (error) {
        console.log('error==========================error');
        console.log(error.message);
        console.log('error==========================error');
        ctx.error();
      }
    }

    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      const result = await ctx.model.models.tenant.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ctx.model.models.ad_group,
            as: 'manager_group',
            required: true,
          },
          {
            model: ctx.model.models.ad_group,
            as: 'supporter_group',
            required: true,
          },
          {
            model: ctx.model.models.group,
            as: 'group',
            required: true,
          },
        ],
      });
      ctx.success(result);
    }

    async create() {
      const { ctx } = this;
      const {
        name, code, manager_group_id, supporter_group_id, group_id,
        justification, budget_type, project_owner,
        contact_person, project_estimation,
        methodology_text } = ctx.request.body;
      if (!name || !code || !manager_group_id || !supporter_group_id || !group_id ||
        !justification || !budget_type || !project_owner ||
        !contact_person || !project_estimation ||
        !methodology_text) ctx.error();
      const existNum = await ctx.model.models.tenant.count({
        where: {
          code,
        },
      });
      if (existNum > 0) ctx.error();
      const model = {
        name,
        code,
        manager_group_id,
        supporter_group_id,
        group_id,
        justification,
        budget_type,
        project_owner,
        contact_person,
        project_estimation,
        methodology_text,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await ctx.model.models.tenant.create(model);
        ctx.success();
      } catch (error) {
        console.log('error ================================== error');
        console.log(error.message);
        console.log('error ================================== error');
        throw { status: 500, message: 'service busy' };
      }
    }

    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const {
        name, manager_group_id, supporter_group_id, group_id,
        justification, budget_type,
        project_owner, contact_person, project_estimation,
        methodology_text } = ctx.request.body;
      if (!id || !name || !manager_group_id || !supporter_group_id || !group_id ||
        !justification || !budget_type ||
        !project_owner || !contact_person || !project_estimation ||
        !methodology_text) ctx.error();
      const oldModel = await ctx.model.models.tenant.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        name,
        manager_group_id,
        supporter_group_id,
        group_id,
        justification,
        budget_type,
        project_owner,
        contact_person,
        project_estimation,
        methodology_text,
        updatedAt: new Date(),
      };
      try {
        await oldModel.update(newModel);
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error.message);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }

    async deleteMany() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { idList } = ctx.request.body;
      if (!idList || !idList.length) ctx.error();
      try {
        await ctx.model.models.tenant.destroy({
          where: {
            id: { [Op.in]: idList },
          },
        });
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error.message);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }

    async checkExist() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { id, code } = ctx.query;
      const count = await ctx.model.models.tenant.count({
        where: {
          code,
          id: { [Op.ne]: id },
        },
      });
      ctx.success(count);
    }

    async getCps() {
      const { ctx } = this;
      const { cpsId } = ctx.query;
      if (!cpsId) ctx.error();
      const vms = [];
      const tenant = {};
      try {
        const url = 'https://cps-dev-api.cldpaast71.serverdev.hadev.org.hk/cps/alladhoc/' + cpsId;
        const result = await ctx.service.syncActiviti.curl(url, { method: 'GET' }, ctx);
        console.log('1', result);
        const data = result.data;
        console.log('2 data[0].adhoc[0]', data[0].adhoc[0]);
        const code = data[0].adhoc[0].project_code;
        tenant.justification = data[0].adhoc[0].justification;
        // search tenant
        if (code) {
          const findTenant = await ctx.model.models.tenant.findOne({
            attributes: [ 'id' ],
            where: {
              code,
            },
          });
          findTenant ? tenant.tenant = findTenant.id : undefined;
        }
        const application_types = await ctx.model.models.vm_applicationType.findAll({
          raw: true,
          attributes: [ 'id', 'name' ],
        });
        const locations = await ctx.model.models.vm_zone.findAll({
          raw: true,
          attributes: [ 'id', 'name' ],
        });
        const platforms = await ctx.model.models.vm_platform_type.findAll({
          raw: true,
          attributes: [ 'id', 'name' ],
        });
        const phases = await ctx.model.models.vm_type.findAll({
          raw: true,
          attributes: [ 'id', 'name' ],
        });
        const rows = data[0].adhoc[0].rows;
        if (rows && rows.length > 0
          && application_types && application_types.length > 0
          && locations && locations.length > 0
          && platforms && platforms.length > 0
          && phases && phases.length > 0
        ) {
          rows.forEach(_ => {
            const application_type = application_types.filter(_ => _.name === _.application_type);
            const network_zone = locations.filter(_ => _.name === _.location);
            const platform = platforms.filter(_ => _.name === _.platform);
            const environment_type = phases.filter(_ => _.name === _.phases);
            if (application_type && network_zone && platform && environment_type) {
              const vm = {
                application_type: application_type.id,
                cpu_request_number: _.cpu_require[0],
                data_storage_request_number: _.disk_require[0],
                environment_type: environment_type.id,
                network_zone: network_zone.id,
                phase: _.phase,
                platform: platform.id,
                ram_request_number: _.mem_require[0],
              };
              vms.push(vm);
            }
          });
        } else if (rows && rows.length > 0) {
          rows.forEach(_ => {
            vms.push(_);
          });
        }
      } catch (error) {
        console.log(error);
        tenant.tenant = 1;
        tenant.justification = 'test';
        const vm = {
          application_type: 3,
          backup_volume: 'test',
          cpu_request_number: '1',
          data_storage_request_number: '800',
          environment_type: 3,
          network_zone: 3,
          phase: 'test11',
          platform: 1,
          ram_request_number: 8,
        };
        vms.push(vm);
      }
      console.log({ tenant, vms });

      ctx.success({ tenant, vms });
    }

    async testCps() {
      const { ctx } = this;
      console.log('testCps');

      const vms = [];
      const tenant = {};
      const url = 'https://cps-dev-api.cldpaast71.serverdev.hadev.org.hk/cps/alladhoc/5b1f7144625da9b4c2ef54c1';
      const result = await ctx.service.syncActiviti.curl(url, { method: 'GET' }, ctx);
      console.log('1 testCps result', result);
      const data = result.data;
      console.log('2 testCps data[0].adhoc[0]', data[0].adhoc[0]);
      const code = data[0].adhoc[0].project_code;
      tenant.justification = data[0].adhoc[0].justification;
      // search tenant
      if (code) {
        const findTenant = await ctx.model.models.tenant.findOne({
          attributes: [ 'id' ],
          where: {
            code,
          },
        });
        findTenant ? tenant.tenant = findTenant.id : undefined;
      }
      const application_types = await ctx.model.models.vm_applicationType.findAll({
        raw: true,
        attributes: [ 'id', 'name' ],
      });
      const locations = await ctx.model.models.vm_zone.findAll({
        raw: true,
        attributes: [ 'id', 'name' ],
      });
      const platforms = await ctx.model.models.vm_platform_type.findAll({
        raw: true,
        attributes: [ 'id', 'name' ],
      });
      const phases = await ctx.model.models.vm_type.findAll({
        raw: true,
        attributes: [ 'id', 'name' ],
      });
      const rows = data[0].adhoc[0].rows;
      if (rows && rows.length > 0
        && application_types && application_types.length > 0
        && locations && locations.length > 0
        && platforms && platforms.length > 0
        && phases && phases.length > 0
      ) {
        rows.forEach(_ => {
          const application_type = application_types.filter(_ => _.name === _.application_type);
          const network_zone = locations.filter(_ => _.name === _.location);
          const platform = platforms.filter(_ => _.name === _.platform);
          const environment_type = phases.filter(_ => _.name === _.phases);
          if (application_type && network_zone && platform && environment_type) {
            const vm = {
              application_type: application_type.id,
              cpu_request_number: _.cpu_require[0],
              data_storage_request_number: _.disk_require[0],
              environment_type: environment_type.id,
              network_zone: network_zone.id,
              phase: _.phase,
              platform: platform.id,
              ram_request_number: _.mem_require[0],
            };
            vms.push(vm);
          }
        });
      } else if (rows && rows.length > 0) {
        rows.forEach(_ => {
          vms.push(_);
        });
      }

      console.log('3 testCps', { tenant, vms });

      ctx.success({ tenant, vms });
    }
  };
};
