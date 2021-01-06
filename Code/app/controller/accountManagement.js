'use strict';

module.exports = app => {
  return class extends app.Controller {

    async userExistsMany() {
      const { ctx } = this;
      const { usernames } = ctx.request.body;
      if (!usernames) ctx.error();
      try {
        const result = await ctx.service.adService.userExistsMany(usernames);
        ctx.success(result);
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }

    async getUsersByEmails() {
      const { ctx } = this;
      const { emails } = ctx.request.body;
      if (!emails) {
        ctx.error();
        return;
      }
      try {
        const result = await ctx.service.syncActiviti.getUsersByEmails({ emails }, { headers: ctx.headers });
        ctx.success(result.data);
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }

    async findUsers() {
      const { ctx } = this;
      const { email, returnType } = ctx.request.body;
      if (!email) ctx.error();
      try {
        const returnResult = [];
        if (!returnType || returnType.toLowerCase() === 'user') {
          const result = await ctx.service.adService.findUsers(email);
          for (const data of result) {
            // todo
            if (data.userPrincipalName === 'Qiwei@apj.com') {
              returnResult.push({
                mail: 'tomqi@apjcorp.com',
                display: 'Tom qi',
              });
            } else if (data.userPrincipalName === 'shenchengan@apj.com') {
              returnResult.push({
                mail: 'rexshen@apjcorp.com',
                display: 'Rex shen',
              });
            } else {
              returnResult.push({
                mail: data.mail ? data.mail : data.userPrincipalName,
                display: data.displayName,
              });
            }
          }
        } else if (returnType.toLowerCase() === 'userordistribution') {
          const users = await ctx.service.adService.findUsers(email);
          for (const data of users) {
            returnResult.push({
              mail: data.mail ? data.mail : data.userPrincipalName,
              display: data.displayName,
            });
          }
          const groups = await ctx.service.adService.findGroups('cn=*' + email + '*');
          for (const data of groups) {
            returnResult.push({
              mail: data.cn,
              display: data.cn,
            });
          }
        } else if (returnType.toLowerCase() === 'distribution') {
          const result = await ctx.service.adService.findGroups('cn=*' + email + '*');
          for (const data of result) {
            returnResult.push({
              mail: data.cn,
              display: data.cn,
            });
          }
        }
        ctx.success(returnResult);
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }

    async checkUsers() {
      const { ctx } = this;
      const { emails } = ctx.request.body;
      if (!emails) ctx.error();
      try {
        const result = await ctx.service.syncActiviti.getUsersByEmails({ emails }, { headers: ctx.headers });
        const data = result.data.map(_ => {
          if (_) {
            return true;
          }
          return false;
        });
        ctx.success(data);
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }
  };
};
