'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { prop, order, createdAt, updatedAt } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'createdAt', 'desc' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.vm_cluster.findAndCountAll({
          where: Object.assign(
            {},
            createdAt ? { createdAt: { [Op.and]: [{ [Op.gte]: new Date(createdAt) }, { [Op.lt]: new Date(new Date(createdAt) - (-8.64e7)) }] } } : undefined,
            updatedAt ? { updatedAt: { [Op.and]: [{ [Op.gte]: new Date(updatedAt) }, { [Op.lt]: new Date(new Date(updatedAt) - (-8.64e7)) }] } } : undefined
          ),
          order: Order,
          offset,
          limit,
        });
        ctx.success(res);
      } catch (error) {
        console.log('error==========================error');
        console.log(error);
        console.log('error==========================error');
        ctx.error();
      }
    }

    async updateResources() {
      const { ctx } = this;
      const {
        vm_clusters,
        vm_masters,
      } = ctx.request.body;
      // if (!serialNumber) ctx.error();
      console.log(vm_clusters, vm_masters);
      try {
        for (const _ of vm_clusters) {
          console.log(_.VMClusterName);
          let vm_cluster = await ctx.model.models.vm_cluster.findOne({
            where: {
              VMClusterName: _.VMClusterName,
            },
          });
          console.log(vm_cluster);
          if (!vm_cluster) {
            vm_cluster = await ctx.model.models.vm_cluster.create(
              Object.assign(_, {
                createdAt: new Date(),
                updatedAt: new Date(),
              })
            );
          } else {
            vm_cluster.update(
              Object.assign(_, {
                updatedAt: new Date(),
              })
            );
          }
        }
        for (const _ of vm_masters) {
          const vm_cluster = await ctx.model.models.vm_cluster.findOne({
            raw: true,
            attributes: [ 'id' ],
            where: {
              VMClusterName: _.VMClusterName,
            },
          });
          _.VMClusterId = vm_cluster.id;
          let vm_master = await ctx.model.models.vm_master.findOne({
            where: {
              VMCMasterName: _.VMCMasterName,
            },
          });
          if (!vm_master) {
            vm_master = await ctx.model.models.vm_master.create(Object.assign(_, {
              createdAt: new Date(),
              updatedAt: new Date(),
            }));
          } else {
            vm_master.update(
              Object.assign(_, {
                updatedAt: new Date(),
              })
            );
          }
        }
        ctx.success(true);
      } catch (error) {
        console.log(error);
        throw { status: 500, message: 'service busy' };
      }
    }
  };
};
