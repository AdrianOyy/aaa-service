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
          sAMAccountName: user.sAMAccountName,
        },
      });
      if (userModel !== null) {
        await userModel.update({
          surname: user.sn,
          givenname: user.givenName,
          displayname: user.displayName,
          email: user.mail ? user.mail : user.userPrincipalName,
          UACDesc: new Date() + 'update',
          updatedAt: new Date(),
        });
      } else {
        userModel = await ctx.model.models.user.create({
          sAMAccountName: user.sAMAccountName,
          surname: user.sn,
          givenname: user.givenName,
          displayname: user.displayName,
          email: user.mail ? user.mail : user.userPrincipalName,
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
          groups[index].id = ad_group.name;
          await ctx.model.models.user_group_mapping.create({
            groupId: ad_group.id,
            userId,
            createdAt: new Date(),
          });
        }
      }
      user.groups = groups;
      user.username = user.sAMAccountName;
      user.userPrincipalName = user.mail ? user.mail : user.userPrincipalName;
      await ctx.service.syncActiviti.loadUser(user, { headers: { Authorization: 'Bearer ' + auth.token } });
      return user;
    }

    async getTenants(userId) {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const where = { id: { [Op.in]: app.Sequelize.literal(`(select tenantId from tenant_group_mapping where ad_groupId in ( select groupId from user_group_mapping where userId = ${userId}))`) } };
      const tenants = await ctx.model.models.tenant.findAll({ where });
      return tenants;
    }

    /**
     *  get group type list by userId
     * @param {number|string} userId user id
     * @return {Promise<string[]>} group type list
     */
    async getGroupTypeList(userId) {
      const { ctx } = this;
      const groupTypeList = [];
      const user = await ctx.model.models.user.findOne({
        where: {
          id: userId,
        },
        include: {
          model: ctx.model.models.user_group_mapping,
          as: 'userGroupMapping',
          required: true,
          include: {
            model: ctx.model.models.ad_group,
            as: 'ad_group',
            required: true,
            include: {
              model: ctx.model.models.groupType,
              as: 'groupType',
              required: true,
            },
          },
        },
      });
      if (!user) {
        return [];
      }
      const {
        userGroupMapping,
      } = user;
      const adGroupMap = new Map();
      userGroupMapping.forEach(el => {
        const { ad_group } = el;
        const { id } = ad_group;
        if (!adGroupMap.get(id)) {
          adGroupMap.set(id, ad_group);
        }
      });
      const groupTypeMap = new Map();
      adGroupMap.forEach(v => {
        const { groupType } = v;
        groupType.forEach(e => {
          if (!groupTypeMap.get(e.id)) {
            groupTypeMap.set(e.id, e.type);
          }
        });
        groupTypeMap.forEach(v => groupTypeList.push(v));
      });

      return groupTypeList;
    }
  };
};
