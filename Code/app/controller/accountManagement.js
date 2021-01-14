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
        const groupQuery = '&(objectClass=group)|(displayName=' + email + '*)(cn=' + email + '*)';
        if (returnType && (returnType.user || returnType.users)) {
          const users = await ctx.service.adService.findUsers(email);
          for (const data of users) {
            if (data.cn && data.displayName) {
              returnResult.push({
                mail: data.mail,
                display: data.displayName,
                corp: data.cn,
              });
            }
          }
        }
        if (returnType && returnType.members) {
          const users = await ctx.service.adService.findUsers(email);
          for (const data of users) {
            if (data.cn && data.displayName) {
              if (data.cn && data.displayName) {
                returnResult.push({
                  mail: data.mail,
                  display: data.displayName,
                  corp: data.cn,
                });
              }
            }
          }
          const adGroups = await ctx.service.adService.findGroups(groupQuery);
          for (const data of adGroups) {
            if (data.cn && data.displayName) {
              returnResult.push({
                mail: data.mail,
                display: data.displayName,
                corp: data.cn,
              });
            }
          }
        }
        if (returnType && returnType.dl) {
          const distributions = await ctx.service.adService.findGroups(groupQuery);
          for (const data of distributions) {
            if (data.mail) {
              returnResult.push({
                mail: data.mail,
                display: data.displayName,
                corp: data.sAMAccountName,
              });
            }
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

    async getDisplayName() {
      const { ctx } = this;
      const { valueList } = ctx.request.body;
      if (!valueList) ctx.success([]);
      const config = app.config.adService;
      const url = `${config.url}/findDisplayNames`;
      const data = await ctx.service.syncActiviti.curl(url, {
        method: 'POST',
        data: {
          keywordList: valueList,
        },
      }, ctx);
      const res = data && data.data ? data.data.data : [];
      ctx.success(res);
    }

    async getPublicKey() {
      const { ctx } = this;
      const { cuid, outbound } = app.config;
      const url = outbound.url + cuid.prefix + cuid.api.getPublicKey;
      try {
        const { data } = await ctx.service.common.request(url, {
          headers: {
            'x-apikey': cuid.apiKey,
          },
        });
        ctx.success(data);
      } catch (e) {
        ctx.error();
        console.log('Error when request ', url);
        console.log('=========================');
        console.log(e.message);
        console.log('=========================');
      }
    }
  };
};
