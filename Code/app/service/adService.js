'use strict';

module.exports = app => {

  return class extends app.Service {
    async authenticate(username, password) {
      const { ctx } = this;
      const config = app.config.adService;
      const expiresIn = app.config.jwt.expiresIn;
      const url = `${config.url}/authenticate`;
      const response = await ctx.service.syncActiviti.curl(url, { data: { username, password } }, ctx);
      const data = response.data.data;
      let result = {};
      if (data && data.auth) {
        const user = data.user;
        const groups = data.groups;
        result.user = user;
        result.groups = groups;
        const options = { content: { username: user.sAMAccountName }, expiresIn };
        const token = ctx.service.jwtUtils.getToken(options);
        result.token = token;
      } else {
        result = false;
      }
      return result;
    }

    async userExistsMany(usernames) {
      const { ctx } = this;
      const config = app.config.adService;
      const url = `${config.url}/userExistsMany`;
      const response = await ctx.service.syncActiviti.curl(url, { data: { usernames } }, ctx);
      const data = response.data.data;
      return data;
    }

    async findUser(username) {
      const { ctx } = this;
      const config = app.config.adService;
      const url = `${config.url}/findUser?username=${username}`;
      const response = await ctx.service.syncActiviti.curl(url, { method: 'GET' }, ctx);
      const data = response.data.data;
      return data;
    }

    async findUsers(email, isCorp) {
      const { ctx } = this;
      const config = app.config.adService;
      const url = `${config.url}/findUsers?email=${email}` + (isCorp ? `&isCorp=${isCorp}` : '');
      const response = await ctx.service.syncActiviti.curl(url, { method: 'GET' }, ctx);
      const data = response.data.data;
      return data;
    }

    async findGroups(groupName) {
      const { ctx } = this;
      const config = app.config.adService;
      const url = `${config.url}/findGroups?groupName=${groupName}`;
      const response = await ctx.service.syncActiviti.curl(url, { method: 'GET' }, ctx);
      const data = response.data.data;
      return data;
    }

    async getUsersForGroup(groupNames) {
      const { ctx } = this;
      const config = app.config.adService;
      const url = `${config.url}/getUsersForGroup`;
      const response = await ctx.service.syncActiviti.curl(url, { data: { groupNames } }, ctx);
      const data = response.data.data;
      return data;
    }

    async findUsersByEmails(emails) {
      const { ctx } = this;
      const config = app.config.adService;
      const url = `${config.url}/findUsersByEmails`;
      const response = await ctx.service.syncActiviti.curl(url, { data: { emails } }, ctx);
      const data = response.data.data;
      return data;
    }
  };
};
