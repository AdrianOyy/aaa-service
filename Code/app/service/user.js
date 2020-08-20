'use strict';

module.exports = app => {

  return class extends app.Service {
    async loadUser(auth) {
      const { ctx } = this;
      if (!auth) {
        return;
      }
      const ad_groups = await ctx.model.models.ad_group.findAll({
        raw: true,
        attributes: [ 'name' ],
      });
      const user = auth.user;
      const groups = auth.groups.filter(_ => {
        let flag = false;
        for (const ad_group of ad_groups) {
          if (ad_group.name === _.cn) {
            flag = true;
            break;
          }
        }
        return flag;
      });
      let userModel = await ctx.model.models.user.findOne({
        where: {
          email: user.userPrincipalName,
        },
      });
      if (userModel !== null) {
        await userModel.update({
          surname: user.sn,
          givenname: user.givenName,
          displayname: user.displayName,
          UACDesc: new Date() + 'update',
          updatedAt: new Date(),
        });
      } else {
        userModel = await ctx.model.models.user.create({
          surname: user.sn,
          givenname: user.givenName,
          displayname: user.displayName,
          email: user.userPrincipalName,
          createdAt: new Date(),
        });
      }
      const userId = userModel.dataValues.id;
      user.id = userId;
      await ctx.model.models.user_group_mapping.destroy({
        where: {
          userId,
        },
        force: true,
      });
      for (let index = 0; index < groups.length; index++) {
        const name = groups[index].cn;
        const ad_group = await ctx.model.models.ad_group.findOne({
          raw: true,
          where: {
            name,
          },
        });
        if (ad_group !== null) {
          groups[index].id = ad_group.id;
          await ctx.model.models.user_group_mapping.create({
            groupId: ad_group.id,
            userId,
            createdAt: new Date(),
          });
        }
      }
      user.groups = groups;
      await ctx.service.syncActiviti.loadUser(user, { headers: { token: auth.token } });
      return user;
    }
  };
};
