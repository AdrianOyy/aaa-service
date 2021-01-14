'use strict';

module.exports = app => {
  const { cps, outbound } = app.config;
  const cpsurl = outbound.url + cps.prefix + cps.api.alladhoc;
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { name, code, manager_group_id, supporter_group_id, group_id,
        justification, budget_type, project_owner,
        contact_person, project_estimation, methodology_text, prop, order } = ctx.query;
      let { createdAt, updatedAt } = ctx.query;
      createdAt = ctx.service.common.getDateRangeCondition(createdAt);
      updatedAt = ctx.service.common.getDateRangeCondition(updatedAt);
      if (createdAt === false || updatedAt === false) {
        ctx.error();
        return;
      }
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
            createdAt ? { createdAt } : undefined,
            updatedAt ? { updatedAt } : undefined
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
          {
            model: ctx.model.models.role,
            as: 'role',
            required: true,
          },
          {
            model: ctx.model.models.ad_group,
            as: 'mapping_group',
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
        methodology_text, roleId, mappingGroupId,
      } = ctx.request.body;
      if (!name || !code || !manager_group_id || !supporter_group_id || !group_id ||
        !justification || !budget_type || !project_owner ||
        !contact_person || !project_estimation ||
        !methodology_text || !roleId || !mappingGroupId
      ) ctx.error();
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
        mapping_group_id: mappingGroupId,
        role_id: roleId,
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
        justification, budget_type, mappingGroupId, roleId,
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
        mapping_group_id: mappingGroupId,
        role_id: roleId,
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
      let errorMessage = '';
      try {
        const { application_types, locations, platforms, phases } = await this.getSelect(ctx);
        const url = cpsurl + cpsId;
        const result = await ctx.service.syncActiviti.curl(url, { method: 'GET' }, ctx);
        const data = result.data;
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
        const rows = data[0].adhoc[0].rows;
        if (rows && rows.length > 0
          && application_types && application_types.length > 0
          && locations && locations.length > 0
          && platforms && platforms.length > 0
          && phases && phases.length > 0
        ) {
          for (const row of rows) {
            const application_type = application_types.filter(_ => _.name === row.application_type);
            const network_zone = locations.filter(_ => _.name === row.location);
            const platform = platforms.filter(_ => _.name === row.platform);
            const environment_type = phases.filter(_ => _.name === row.phase);
            application_type.length === 0
              && errorMessage.indexOf(row.application_type + ' does not exist;') === -1
              ? errorMessage += row.application_type + ' does not exist;' : undefined;
            network_zone.length === 0
              && errorMessage.indexOf(row.location + ' does not exist;') === -1
              ? errorMessage += row.location + ' does not exist;' : undefined;
            platform.length === 0
              && errorMessage.indexOf(row.platform + ' does not exist;') === -1
              ? errorMessage += row.platform + ' does not exist;' : undefined;
            environment_type.length === 0
              && errorMessage.indexOf(row.phase + ' does not exist;') === -1
              ? errorMessage += row.phase + ' does not exist;' : undefined;
            if (application_type.length > 0 && network_zone.length > 0 && platform.length > 0 && environment_type.length > 0) {
              const vm = {
                application_type: application_type.length > 0 ? application_type[0].id : undefined,
                cpu_request_number: row.cpu_require[0],
                data_storage_request_number: row.disk_require[0],
                environment_type: environment_type.length > 0 ? environment_type[0].id : undefined,
                network_zone: network_zone.length > 0 ? network_zone[0].id : undefined,
                phase: row.phase,
                platform: platform.length > 0 ? platform[0].id : undefined,
                ram_request_number: row.mem_require[0],
              };
              vms.push(vm);
            }
          }
        } else {
          !application_types || application_types.length === 0 ? errorMessage += 'vm_applicationType does not exist;' : undefined;
          !locations || locations.length === 0 ? errorMessage += 'vm_cdc does not exist;' : undefined;
          !platforms || platforms.length === 0 ? errorMessage += 'vm_platform does not exist;' : undefined;
          !phases || phases.length === 0 ? errorMessage += 'vm_type does not exist;' : undefined;
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
      console.log({ tenant, vms }, errorMessage);
      if (vms.length > 0 && errorMessage === '') {
        ctx.success({ tenant, vms });
      } else {
        ctx.error(errorMessage);
      }

    }

    async testCps() {
      const { ctx } = this;
      console.log('testCps');

      const vms = [];
      const tenant = {};
      const url = cpsurl + '5b1f7144625da9b4c2ef54c1';
      try {
        const { application_types, locations, platforms, phases } = await this.getSelect(ctx);
        console.log('1 select list:-------------');
        console.log('application_types', application_types);
        console.log('locations', locations);
        console.log('platforms', platforms);
        console.log('phases', phases);
        const result = await ctx.service.syncActiviti.curl(url, { method: 'GET' }, ctx);
        const data = result.data;
        console.log('data', data);
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
        const rows = data[0].adhoc[0].rows;
        if (rows && rows.length > 0
          && application_types && application_types.length > 0
          && locations && locations.length > 0
          && platforms && platforms.length > 0
          && phases && phases.length > 0
        ) {
          for (const row of rows) {
            console.log('row', row);
            console.log('row.application_type', row.application_type);
            console.log('row.location', row.location);
            console.log('row.platform', row.platform);
            console.log('row.phase', row.phase);
            const application_type = application_types.filter(_ => _.name === row.application_type);
            const network_zone = locations.filter(_ => row.location && row.location.indexOf(_.name) !== -1);
            const platform = platforms.filter(_ => _.name === row.platform);
            const environment_type = phases.filter(_ => _.name === row.phase);
            console.log('application_type', application_type, 'network_zone', network_zone, 'platform', platform, 'environment_type', environment_type);
            const vm = {
              application_type: application_type.length > 0 ? application_type[0].id : undefined,
              cpu_request_number: row.cpu_require[0],
              data_storage_request_number: row.disk_require[0],
              environment_type: environment_type.length > 0 ? environment_type[0].id : undefined,
              network_zone: network_zone.length > 0 ? network_zone[0].id : undefined,
              phase: row.phase,
              platform: platform.length > 0 ? platform[0].id : undefined,
              ram_request_number: row.mem_require[0],
            };
            vms.push(vm);
          }
        }
        console.log('3 testCps', { tenant, vms });
        ctx.success({ tenant, vms });
      } catch (error) {
        console.log(error);
        ctx.success(error);
      }

    }

    async getSelect(ctx) {
      console.log('getSelect');
      const application_types = await ctx.model.models.vm_applicationType.findAll({
        raw: true,
        attributes: [ 'id', 'name' ],
      });
      const locations = await ctx.model.models.vm_cdc.findAll({
        raw: true,
        attributes: [ 'id', 'name' ],
      });
      const platforms = await ctx.model.models.vm_platform.findAll({
        raw: true,
        attributes: [ 'id', 'name' ],
      });
      const phases = await ctx.model.models.vm_type.findAll({
        raw: true,
        attributes: [ 'id', 'name' ],
      });
      return { application_types, locations, platforms, phases };
    }
  };
};
