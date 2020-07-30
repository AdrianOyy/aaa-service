'use strict';

module.exports = app => {

  return class extends app.Service {
    async checkUser(auth) {
      const { ctx } = this;
      if (!auth) {
        return;
      }
      const user = auth.user;
      const userModel = await ctx.model.models.user.findOne({
        where: {
          email: user.userPrincipalName,
        },
      });
      if (userModel !== null) {
        userModel.update({
          surname: user.sn,
          givenname: user.givenName,
          displayName: user.displayName,
          UACDesc: new Date() + 'update',
          updatedAt: new Date(),
        });
      } else {
        await ctx.model.models.user.create({
          surname: user.sn,
          givenname: user.givenName,
          displayName: user.displayName,
          email: user.userPrincipalName,
          createdAt: new Date(),
        });
      }
    }
  };
};
