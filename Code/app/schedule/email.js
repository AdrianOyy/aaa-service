'use strict';

module.exports = app => {
  return {
    schedule: {
      interval: app.config.schedule.interval,
      immediate: true,
      type: 'all',
    },
    async task(ctx) {
      await ctx.service.imap.createBox();
      const messages = await ctx.service.imap.fetchMessages();
      if (!messages || messages.length <= 0) {
        return;
      }
      const token = await ctx.service.jwtUtils.getToken({ content: { username: 'shenchengan' }, expiresIn: app.config.jwt.expiresIn });
      const { actionMessage, otherUIDS } = await ctx.service.imap.getActionMessageAndOtherUIDS(ctx, messages);
      // action task
      const result = await ctx.service.syncActiviti.getEmailFolder(actionMessage, { headers: { Authorization: 'Bearer ' + token } });
      const folders = await ctx.service.imap.getFolders(result, otherUIDS);
      console.log(folders);
      await ctx.service.imap.moveTo(folders);
    },
  };
};
