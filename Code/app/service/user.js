'use strict';

module.exports = app => {

  return class extends app.Service {
    async loadUser(auth) {
      const { ctx } = this;
      if (!auth) {
        return;
      }
      const user = auth.user;
      const groups = auth.groups;
      console.log({ user, groups });
      let userModel = await ctx.model.models.user.findOne({
        where: {
          email: user.userPrincipalName,
        },
      });
      if (userModel !== null) {
        await userModel.update({
          surname: user.sn,
          givenname: user.givenName,
          displayName: user.displayName,
          UACDesc: new Date() + 'update',
          updatedAt: new Date(),
        });
      } else {
        userModel = await ctx.model.models.user.create({
          surname: user.sn,
          givenname: user.givenName,
          displayName: user.displayName,
          email: user.userPrincipalName,
          createdAt: new Date(),
        });
      }
      user.id = userModel.dataValues.id;
      for (let index = 0; index < groups.length; index++) {
        const name = groups[index].cn;
        let ad_group = await ctx.model.models.ad_group.findOne({
          raw: true,
          where: {
            name,
          },
        });
        if (ad_group !== null) {
          groups[index].id = ad_group.id;
        } else {
          ad_group = await ctx.model.models.ad_group.create({
            name,
            createdAt: new Date(),
          });
          groups[index].id = ad_group.id;
        }
      }
      user.groups = groups;
      await ctx.service.syncActiviti.loadUser(user);
    }
  };
};
