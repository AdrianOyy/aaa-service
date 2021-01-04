'use strict';

module.exports = app => {
  return {
    schedule: {
      interval: app.config.schedule.userinterval,
      immediate: true,
      type: 'all',
    },
    async task(ctx) {
      return;
      // console.log(new Date(), 'load user task start');
      // try {
      //   const tenants = await ctx.model.models.tenant.findAll({
      //     raw: true,
      //     attributes: [ 'name', 'code' ],
      //     include: [
      //       {
      //         model: ctx.model.models.ad_group,
      //         as: 'manager_group',
      //         required: true,
      //       },
      //     ],
      //   });
      //   console.log(new Date(), 'load user task tenants length ', tenants.length);
      //   const groupNames = [];
      //   const searchGroups = [];
      //   for (let i = 0; i < tenants.length; i++) {
      //     if (tenants[i]['manager_group.name'] && !groupNames.includes(tenants[i]['manager_group.name'])) {
      //       groupNames.push(tenants[i]['manager_group.name']);
      //       searchGroups.push({
      //         id: tenants[i]['manager_group.id'],
      //         name: tenants[i]['manager_group.name'],
      //       });
      //     }
      //   }
      //   if (groupNames.length === 0) {
      //     console.log(new Date(), 'load user task: groupNames length 0');
      //     return;
      //   }
      //   console.log(new Date(), 'load user task: groupNames ', groupNames);
      //   console.log(new Date(), 'load user task: getUsersForGroup start');
      //   const groupUsers = await ctx.service.adService.getUsersForGroup(groupNames);
      //   console.log(new Date(), 'load user task: getUsersForGroup end');
      //   const oldUsers = await ctx.model.models.user.findAll({
      //     raw: true,
      //     attributes: [ 'sAMAccountName' ],
      //   });
      //   const filterUsers = [];
      //   if (oldUsers && oldUsers.length > 0) {
      //     oldUsers.forEach(_ => {
      //       if (_.sAMAccountName) {
      //         filterUsers.push(_.sAMAccountName);
      //       }
      //     });
      //   }
      //   console.log(new Date(), 'load user task filterUsers length ', filterUsers.length);
      //   const loadUsers = groupUsers.filter(_ => !filterUsers.includes(_.user.sAMAccountName));
      //   console.log(new Date(), 'load user task loadUsers length ', loadUsers.length);
      //   const token = await ctx.service.jwtUtils.getToken({ content: { username: 'shenchengan' }, expiresIn: app.config.jwt.expiresIn });
      //   for (let i = 0; i < loadUsers.length; i++) {
      //     const auth = loadUsers[i];
      //     auth.token = token;
      //     await ctx.service.user.loadUser(auth);
      //   }
      // } catch (error) {
      //   console.log(new Date(), 'load user task error', error);
      // }
      // console.log(new Date(), 'load user task end');
    },
  };
};
