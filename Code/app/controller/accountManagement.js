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
        const groupQuery = '&(objectClass=group)|(displayName=*' + email + '*)(cn=*' + email + '*)(sAMAccountName=*' + email + '*)';
        if (returnType && returnType.users) {
          const users = await ctx.service.adService.findUsers(email);
          for (const data of users) {
            // todo
            if (data.userPrincipalName === 'Qiwei@apj.com') {
              returnResult.push({
                mail: 'tomqi@apjcorp.com',
                display: 'Tom qi',
                corp: data.cn,
              });
            } else if (data.userPrincipalName === 'shenchengan@apj.com') {
              returnResult.push({
                mail: 'rexshen@apjcorp.com',
                display: 'Rex shen',
                corp: data.cn,
              });
            } else {
              if ((data.mail || data.userPrincipalName) && data.displayName) {
                returnResult.push({
                  mail: data.mail ? data.mail : data.userPrincipalName,
                  display: data.displayName,
                  corp: data.cn,
                });
              }
            }
          }
        } else if (returnType && returnType.members) {
          const users = await ctx.service.adService.findUsers(email);
          for (const data of users) {
            // todo
            if (data.userPrincipalName === 'Qiwei@apj.com') {
              returnResult.push({
                mail: 'tomqi@apjcorp.com',
                display: 'Tom qi',
                corp: data.cn,
              });
            } else if (data.userPrincipalName === 'shenchengan@apj.com') {
              returnResult.push({
                mail: 'rexshen@apjcorp.com',
                display: 'Rex shen',
                corp: data.cn,
              });
            } else {
              if ((data.mail || data.userPrincipalName) && data.displayName) {
                returnResult.push({
                  mail: data.mail ? data.mail : data.userPrincipalName,
                  display: data.displayName,
                  corp: data.cn,
                });
              }
            }
          }
          const adGroups = await ctx.service.adService.findGroups(groupQuery);
          for (const data of adGroups) {
            if (data.mail) {
              returnResult.push({
                mail: data.displayName ? data.displayName : data.cn,
                display: data.displayName ? data.displayName : data.cn,
                corp: data.cn,
              });
            }
          }
        } else if (returnType && returnType.dl) {
          const distributions = await ctx.service.adService.findGroups(groupQuery);
          for (const data of distributions) {
            returnResult.push({
              mail: data.displayName ? data.displayName : data.cn,
              display: data.displayName ? data.displayName : data.cn,
              corp: data.cn,
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

    async getDisplayName() {
      const { ctx } = this;
      const { valueList, returnType, isCorp } = ctx.request.body;
      if (!valueList) ctx.success([]);
      const config = app.config.adService;
      const url = `${config.url}/findDisplayNames`;
      const a = {
        emails: isCorp ? undefined : valueList,
        corps: isCorp ? valueList : undefined,
        type: returnType,
      };
      const data = await ctx.service.syncActiviti.curl(url, {
        method: 'POST',
        data: {
          emails: isCorp ? undefined : valueList,
          corps: isCorp ? valueList : undefined,
          type: returnType,
        },
      }, ctx);
      const res = data && data.data ? data.data.data : [];
      ctx.success(res);
    }

    async getPublicKey() {
      const { ctx } = this;
      const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8HMr2CBpoZPm3t9tCVlrKtTmI4jNJc7/HhxjIEiDjC8czP4PV+44LjXvLYcSV0fwi6nE4LH2c5PBPEnPfqp0g8TZeX+bYGvd70cXee9d8wHgBqi4k0J0X33c0ZnW7JruftPyvJo9OelYSofBXQTcwI+3uIl/YvrgQRv6A5mW01QIDAQAB';
      ctx.success(publicKey);
    }
  };
};
