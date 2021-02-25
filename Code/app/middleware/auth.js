'use strict';
const jwt = require('jsonwebtoken');

module.exports = (options, app) => {
  return async (ctx, next) => {
    const { ignore, ignoreUser } = options;
    const { url } = ctx.request;
    const path = url.split('?')[0];
    const ignoreUsers = ignoreUser.split(',');
    if (!ignore.includes(path)) {
      const { authorization } = ctx.header;
      if (!authorization) {
        ctx.throw(401);
        return;
      }
      const { username, iss, exp } = jwt.decode(authorization.slice(7), app.config.jwt.secret);
      if (iss !== app.config.jwt.iss) ctx.throw(401);
      if ((new Date() - 0) / 1000 - exp > 0) ctx.throw(401);
      if (ignoreUsers.includes(path) && !username) {
        await next();
      } else {
        if (!username) {
          console.log(new Date(), 'not ignoreUser path: ', path);
        }
        const user = await ctx.model.models.user.findOne({
          where: {
            sAMAccountName: username,
          },
        });
        if (!user) ctx.throw(401);
        ctx.authUser = {
          id: user.id,
          name: user.displayname,
          sAMAccountName: user.sAMAccountName,
          email: user.email,
        };
        await next();
        const option = { content: { username: user.sAMAccountName }, expiresIn: app.config.jwt.expiresIn };
        const newToken = ctx.service.jwtUtils.getToken(option);
        if (ctx.response.body) {
          Object.assign(ctx.response.body, { newToken });
        }
      }
    }
  };
};
