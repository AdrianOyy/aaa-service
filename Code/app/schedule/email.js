'use strict';

const imapFlag = process.env.npm_config_imapFlag ? process.env.npm_config_imapFlag : 'N';
const fetchIndex = process.env.npm_config_fetchIndex ? process.env.npm_config_fetchIndex : '1:*';
const namespace = process.env.npm_config_namespace ? process.env.npm_config_namespace : null;

module.exports = app => {
  return {
    schedule: {
      interval: app.config.schedule.interval,
      immediate: true,
      type: 'all',
    },
    async task(ctx) {
      if (imapFlag !== 'Y') {
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
        const token = await ctx.service.jwtUtils.getToken({ content: { username: 'shenchengan' }, expiresIn: app.config.jwt.expiresIn });
        console.log(new Date(), 'get ActionMessage And OtherUIDS');
        const { actionMessage, otherUIDS } = await ctx.service.imap.getActionMessageAndOtherUIDS(ctx, messages);
        // action task
        console.log(new Date(), 'get Email Folder');
        const result = await ctx.service.syncActiviti.getEmailFolder(actionMessage, { headers: { Authorization: 'Bearer ' + token } });
        console.log(new Date(), 'get Folders');
        const folders = await ctx.service.imap.getFolders(result, otherUIDS);
        console.log(new Date(), 'before moveTo', folders);
        await ctx.service.imap.moveTo(folders);
        console.log(new Date(), 'after moveTo');
      } catch (error) {
        console.log(new Date(), 'task error', error);
      }
    },
  };
};
