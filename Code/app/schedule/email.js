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
        ctx.logger.info(new Date(), 'create box', 'namespace', namespace);
        await ctx.service.imap.createBox(namespace);
        ctx.logger.info(new Date(), 'fetch Messages', 'fetchIndex', fetchIndex);
        const messages = await ctx.service.imap.fetchMessages(fetchIndex);
        if (!messages || messages.length <= 0) {
          return;
        }
        ctx.logger.info(new Date(), 'get ActionMessage And OtherUIDS');
        const { actionMessage, otherUIDS, username } = await ctx.service.imap.getActionMessageAndOtherUIDS(ctx, messages);
        // action task
        ctx.logger.info(new Date(), 'get Email Folder');
        const token = await ctx.service.jwtUtils.getToken({ content: { username }, expiresIn: app.config.jwt.expiresIn });
        const result = await ctx.service.syncActiviti.getEmailFolder(actionMessage, { headers: { Authorization: 'Bearer ' + token } });
        ctx.logger.info(new Date(), 'get Folders');
        const folders = await ctx.service.imap.getFolders(result, otherUIDS, actionMessage);
        ctx.logger.info(new Date(), 'before moveTo', folders);
        await ctx.service.imap.moveTo(folders);
        ctx.logger.info(new Date(), 'after moveTo');
      } catch (error) {
        ctx.logger.error(new Date(), 'task error', error);
        console.log(new Date(), 'task error', error);
      }
    },
  };
};
