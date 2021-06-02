'use strict';

module.exports = app => {
  return class extends app.Controller {
    async sendMail() {
      const { ctx } = this;
      const { from, to, cc, subject, html } = ctx.request.body;
      if (!to || !subject || !html) ctx.error('to or subject or html is null');
      try {
        const info = await ctx.service.mailer.sentMailTask(from, to, cc ? cc : null, subject, html);
        ctx.success(info);
      } catch (error) {
        ctx.logger.error(error);
        console.log('error==========================error');
        console.log(error);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }
  };
};
