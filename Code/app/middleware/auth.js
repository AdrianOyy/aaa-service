'use strict';
const jwt = require('jsonwebtoken');

module.exports = (options, app) => {
  return async (ctx, next) => {
    const { ignore } = options;
    const { url } = ctx.request;
    const path = url.split('?')[0];
    if (!ignore.includes(path)) {
      const { authorization } = ctx.header;
      if (!authorization) {
        ctx.throw(401);
        return;
      }
      const { username, iss, exp } = jwt.decode(authorization.slice(7), app.config.jwt.secret);
      if (iss !== app.config.jwt.iss) ctx.throw(401);
      if ((new Date() - 0) / 1000 - exp > 0) ctx.throw(401);
      const user = await ctx.model.models.user.findOne({
        where: {
          sAMAccountName: username,
        },
      });
      if (!user) ctx.throw(401);
      ctx.authUser = {
        id: user.id,
        name: user.displayname,
      };
    }
    await next();
  };
};
