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
      const returnResult = [];
      try {
        if (returnType && (returnType.user || returnType.users)) {
          let users = await ctx.service.adService.findUsers(email + '*');
          !users || users.length <= 0 ? users = await ctx.service.adService.findUsers('*' + email + '*') : undefined;
          if (users && users.length > 0) {
            console.log(new Date(), 'findUsers users', users.length);
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
        }
        if (returnType && returnType.members) {
          let users = await ctx.service.adService.findUsers(email + '*');
          !users || users.length <= 0 ? users = await ctx.service.adService.findUsers('*' + email + '*') : undefined;
          if (users && users.length > 0) {
            console.log(new Date(), 'findUsers members : users', users.length);
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
          }
          const adGroups = await ctx.service.adService.findGroups('*' + email + '*');
          if (adGroups && adGroups.length > 0) {
            console.log(new Date(), 'findUsers members : adGroups', adGroups.length);
            for (const data of adGroups) {
              if (data.cn) {
                returnResult.push({
                  mail: data.mail,
                  display: data.cn,
                  corp: data.cn,
                });
              }
            }
          }
        }
        if (returnType && returnType.dl) {
          const distributions = await ctx.service.adService.findGroups('*' + email + '*');
          if (distributions && distributions.length > 0) {
            console.log(new Date(), 'findUsers dl adGroups', distributions.length);
            console.log(new Date(), 'findUsers dl distributions', distributions.length ? distributions.filter(_ => _.mail).length : distributions.length);
            for (const data of distributions) {
              if (data.mail) {
                returnResult.push({
                  mail: data.mail,
                  display: data.cn,
                  corp: data.cn,
                });
              }
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
      ctx.success(returnResult);
    }
    async testfindUsers() {
      const { ctx } = this;
      const { search } = ctx.request.body;
      if (!search || !(search instanceof Array)) ctx.error();
      try {
        const returnResult = [];
        for (let index = 0; index < search.length; index++) {
          const email = search[index].email;
          const method = search[index].method;
          if (method === 'user') {
            console.log(new Date(), 'testfindUsers-findUsers start query: ', email);
            const users = await ctx.service.adService.findUsers(email);
            console.log(new Date(), 'testfindUsers-findUsers end. users length: ', users.length);
            returnResult.push({ number: index, type: 'findUsers', email, resultLength: users.length, result: users });
          } else if (method === 'group') {
            console.log(new Date(), 'testfindUsers-findGroups start query: ', email);
            const adGroups = await ctx.service.adService.findGroups(email);
            console.log(new Date(), 'testfindUsers-findGroups end. adGroups length: ', adGroups.length);
            returnResult.push({ number: index, type: 'findGroups', email, resultLength: adGroups.length, result: adGroups });
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
      const outbound = app.config.outbound;
      const adService = app.config.adService;
      const url = `${outbound.url}${adService.prefix}/findDisplayNames`;
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
        ctx.logger.error(e);
        console.log('Error when request ', url);
        console.log('=========================');
        console.log(e.message);
        console.log('=========================');
      }
    }
  };
};
