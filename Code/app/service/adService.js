'use strict';

module.exports = app => {
  const { outbound, adService, jwt } = app.config;
  const adURL = outbound.url + adService.prefix;

  return class extends app.Service {
    async authenticate(username, password) {
      const { ctx } = this;
      const url = adURL + adService.api.auth;
      const response = await ctx.service.syncActiviti.curl(url, { data: { username, password } }, ctx);
      const { data } = response.data;
      let result = {};
      if (data && data.auth) {
        const user = data.user;
        const groups = data.groups;
        result.user = user;
        result.groups = groups;
        const options = {
          content: {
            username: user.sAMAccountName,
          },
          expiresIn: jwt.expiresIn,
        };
        result.token = ctx.service.jwtUtils.getToken(options);
      } else {
        result = false;
      }
      return result;
    }

    async userExistsMany(usernames) {
      const { ctx } = this;
      const url = adURL + adService.api.userExistsMany;
      const response = await ctx.service.syncActiviti.curl(url, { data: { usernames } }, ctx);
      return response.data.data;
    }

    async findUser(username) {
      const { ctx } = this;
      const url = adURL + adService.api.findUser + '?username=' + username;
      const response = await ctx.service.syncActiviti.curl(url, { method: 'GET' }, ctx);
      return response.data.data;
    }

    async findUsers(email) {
      const { ctx } = this;
      const url = adURL + adService.api.findUsers + '?email=' + email;
      const response = await ctx.service.syncActiviti.curl(url, { method: 'GET' }, ctx);
      return response.data.data;
    }

    async findGroups(groupName) {
      const { ctx } = this;
      const url = adURL + adService.api.findGroups + '?groupName=' + groupName;
      const response = await ctx.service.syncActiviti.curl(url, { method: 'GET' }, ctx);
      return response.data.data;
    }

    async getUsersForGroup(groupNames) {
      const { ctx } = this;
      const url = adURL + adService.api.getUsersForGroup;
      const response = await ctx.service.syncActiviti.curl(url, { data: { groupNames } }, ctx);
      return response.data.data;
    }

    async findUsersByCn(emails) {
      const { ctx } = this;
      const url = adURL + adService.api.findUsersByCn;
      const response = await ctx.service.syncActiviti.curl(url, { data: { emails } }, ctx);
      return response.data.data;
    }
  };
};
