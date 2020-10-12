'use strict';

module.exports = app => {
  return class extends app.Controller {

    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { surname, prop, order } = ctx.query;
      const where = Object.assign(
        {},
        surname ? { surname: { [Op.like]: `%${surname}%` } } : undefined
      );

      // 过滤无用条件
      Object.keys(where).forEach(k => {
        if (where[k] === undefined || where[k] === '' || !where[k]) {
          delete where[k];
        }
      });
      let Order = [[ 'surname', 'DESC' ]];
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
        const user = await ctx.service.user.loadUser(auth, username);
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
          user.groupList = groupList;
          user.groups = auth.groups;
          auth.user = user;
        }
        // const auth = {
        //   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJTRU5TRVBMQVRGT1JNIiwiZXhwIjoxNjAwNjYwOTU3LCJ1c2VybmFtZSI6InNoZW5jaGVuZ2FuIn0.zHdqlwuYbLrOUcIqUji7x4rtncLUGhQcD-428hObAAs',
        //   user: {
        //     cn: 'shenchengan',
        //     displayName: 'shenchengan',
        //     distinguishedName: 'CN=shenchengan,OU=EEL,OU=Employees,DC=apj,DC=com',
        //     dn: 'CN=shenchengan,OU=EEL,OU=Employees,DC=apj,DC=com',
        //     givenName: 'chengan',
        //     groupList: [ '0' ],
        //     groups: [{ dn: 'CN=IOS.ISMS,OU=APJ,OU=Groups,DC=apj,DC=com', cn: 'IOS.ISMS' }],
        //     id: 1,
        //     lockoutTime: '0',
        //     pwdLastSet: '131886269639898322',
        //     sAMAccountName: 'shenchengan',
        //     sn: 'shen',
        //     userAccountControl: '66048',
        //     userPrincipalName: 'shenchengan@apj.com',
        //     whenCreated: '20141201053009.0Z',
        //   },
        // };
        ctx.success(auth);
      } else {
        ctx.success(auth);
      }
    }

    async findUser() {
      const { ctx } = this;
      const { username } = ctx.request.body;
      const user = await ctx.service.adService.findUser(username);
      ctx.success(user);
    }
  };
};
