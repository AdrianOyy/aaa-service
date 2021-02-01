'use strict';

module.exports = app => {
  const { flag, fetchIndex, namespace, interval } = app.config.imap;
  return {
    schedule: {
      interval,
      immediate: true,
      type: 'all',
    },
    async task(ctx) {
      if (flag !== 'Y') {
        return;
      }
      try {
        console.log(new Date(), 'create box', 'namespace', namespace);
        await ctx.service.imap.createBox(namespace);
        console.log(new Date(), 'fetch Messages', 'fetchIndex', fetchIndex);
        const messages = await ctx.service.imap.fetchMessages(fetchIndex);
        if (!messages || messages.length <= 0) {
          return;
        }
        const token = await ctx.service.jwtUtils.getToken({ content: { username: '' }, expiresIn: app.config.jwt.expiresIn });
        console.log(new Date(), 'get ActionMessage And OtherUIDS');
        const { actionMessage, otherUIDS } = await ctx.service.imap.getActionMessageAndOtherUIDS(ctx, messages);
        // action task
        console.log(new Date(), 'get Email Folder');
        const result = await ctx.service.syncActiviti.getEmailFolder(actionMessage, { headers: { Authorization: 'Bearer ' + token } });
        console.log(new Date(), 'get Folders');
        const folders = await ctx.service.imap.getFolders(result, otherUIDS, actionMessage);
        console.log(new Date(), 'before moveTo', folders);
        await ctx.service.imap.moveTo(folders);
        console.log(new Date(), 'after moveTo');
      } catch (error) {
        console.log(new Date(), 'task error', error);
      }
    },
  };
};
