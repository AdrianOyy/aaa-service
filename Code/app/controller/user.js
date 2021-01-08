'use strict';

module.exports = app => {
  return class extends app.Controller {

    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { surname, givenName, displayName, email, prop, order } = ctx.query;
      let { createdAt, updatedAt } = ctx.query;
      createdAt = ctx.service.common.getDateRangeCondition(createdAt);
      updatedAt = ctx.service.common.getDateRangeCondition(updatedAt);
      if (createdAt === false || updatedAt === false) {
        ctx.error();
        return;
      }
      const where = Object.assign(
        {},
        surname ? { surname: { [Op.like]: `%${surname}%` } } : undefined,
        givenName ? { givenname: { [Op.like]: `%${givenName}%` } } : undefined,
        displayName ? { displayname: { [Op.like]: `%${displayName}%` } } : undefined,
        email ? { email: { [Op.like]: `%${email}%` } } : undefined,
        createdAt ? { createdAt } : undefined,
        updatedAt ? { updatedAt } : undefined
      );

      // 过滤无用条件
      Object.keys(where).forEach(k => {
        if (where[k] === undefined || where[k] === '' || !where[k]) {
          delete where[k];
        }
      });
      let Order = [[ 'createdAt', 'DESC' ]];
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
      try {
        const { username, password } = ctx.request.body;
        if (!username || !password) ctx.error();
        const auth = await ctx.service.adService.authenticate(username, password);
        if (auth) {
          if (auth.user && auth.user.userPrincipalName === 'shenchengan@apj.com') {
            auth.user.userPrincipalName = 'rexshen@apjcorp.com';
          }
          if (auth.user && auth.user.userPrincipalName === 'Qiwei@apj.com') {
            auth.user.userPrincipalName = 'tomqi@apjcorp.com';
          }
          if (auth.user && auth.user.userPrincipalName === 'yangzhihong@apj.com') {
            auth.user.userPrincipalName = 'morseyang@apjcorp.com';
          }
          if (auth.user && auth.user.userPrincipalName === 'lijunjie@apj.com') {
            auth.user.userPrincipalName = 'amaneru@163.com';
          }
          const user = await ctx.service.user.loadUser(auth);
          if (user) {
            const groupList = [];
            // const userGroup = await ctx.model.models.user_group_mapping.findAll({ where: { userId: user.id } });
            for (const ug of auth.groups) {
              if (ug.id) {
                groupList.push(ug.id.toString());
              } else {
                groupList.push('0');
              }
            }
            user.groupTypeList = await ctx.service.user.getGroupTypeList(user.id);
            user.groupList = groupList;
            user.groups = auth.groups;
            auth.user = user;
          }
          ctx.success(auth);
        } else {
          ctx.success(auth);
        }
      } catch (error) {
        console.log(error.message);
        ctx.error();
      }
    }

    async findUser() {
      const { ctx } = this;
      const { username } = ctx.request.body;
      const user = await ctx.service.adService.findUser(username);
      ctx.success(user);
    }

    async getUsersForGroup() {
      const { ctx } = this;
      const { groupNames } = ctx.request.body;
      const oldUsers = await ctx.model.models.user.findAll({
        raw: true,
        attributes: [ 'sAMAccountName' ],
      });
      const filterUsers = [];
      if (oldUsers && oldUsers.length > 0) {
        oldUsers.forEach(_ => {
          if (_.sAMAccountName) {
            filterUsers.push(_.sAMAccountName);
          }
        });
      }
      const groupUsers = await ctx.service.adService.getUsersForGroup(groupNames);
      const result = [];
      if (groupUsers && groupUsers.length > 0) {
        groupUsers.forEach(_ => {
          if (filterUsers.includes(_.user.sAMAccountName)) {
            result.push({ mail: (_.user.mail ? _.user.mail : _.user.userPrincipalName), isLogin: true });
          } else {
            result.push({ mail: (_.user.mail ? _.user.mail : _.user.userPrincipalName), isLogin: false });
          }
        });
      }
      ctx.success(result);
    }
  };
};
