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
      if (!emails) ctx.error();
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
            returnResult.push(data.userPrincipalName);
          }
        } else if (returnType.toLowerCase() === 'userordistribution') {
          const result = await ctx.service.adService.findUsers(email);
          for (const data of result) {
            returnResult.push(data.userPrincipalName);
          }
        } else if (returnType.toLowerCase() === 'distribution') {
          const result = await ctx.service.adService.findUsers(email);
          for (const data of result) {
            returnResult.push(data.userPrincipalName);
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
        console.log(data);
        ctx.success(data);
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }
  };
};
