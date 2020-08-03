'use strict';

module.exports = app => {
  return class extends app.Controller {

    async list() {
      const { ctx } = this;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { surname, prop, order } = ctx.query;
      const where = { surname };

      // 过滤无用条件
      Object.keys(where).forEach(k => {
        if (where[k] === undefined || where[k] === '' || !where[k]) {
          delete where[k];
        }
      });
      let Order = [ 'surname', 'desc' ];
      if (order && prop) {
        Order = [[ `${prop}`, `${order}` ]];
      }
      const findAdParams = {
        where,
        order: Order,
        offset,
        limit,
      };
      const result = await ctx.model.models.user.findAndCountAll(findAdParams);
      ctx.success(result);
    }

    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      const result = await ctx.model.models.user.findOne({
        raw: true,
        where: {
          id,
        },
      });
      ctx.success(result);
    }

    async login() {
      const { ctx } = this;
      const { username, password } = ctx.request.body;
      // const pass = await ctx.service.decryption.decrypteds(password);
      const auth = await ctx.service.adService.authenticate(username, password);
      ctx.service.user.loadUser(auth);
      ctx.success(auth !== null && auth !== false ? auth.token : auth);
    }

    async testGroup() {
      const { ctx } = this;
      const group = await ctx.model.models.ad_group.create({
        name: 'Bossini.common',
        createdAt: new Date(),
      });
      await ctx.service.syncActiviti.saveOrUpdateGroup({
        id: group.dataValues.id,
        dn: 'CN=Bossini.common,OU=Bossini,OU=Groups,DC=apj,DC=com',
        cn: 'Bossini.common',
        distinguishedName: 'CN=Bossini.common,OU=Bossini,OU=Groups,DC=apj,DC=com',
        objectCategory: 'CN=Group,CN=Schema,CN=Configuration,DC=apj,DC=com',
      });
      // await ctx.service.syncActiviti.saveOrUpdateGroup({
      //   id: '-99999',
      //   cn: 'Bossini.common111',
      // });
      // await ctx.service.syncActiviti.deleteGroup([ group.dataValues.id ]);
      await group.destroy(group.dataValues.id);
      // const groups = await ctx.model.models.ad_group.findAll({
      //   raw: true,
      // });
      // console.log(groups);
      ctx.success(true);
    }
  };
};
