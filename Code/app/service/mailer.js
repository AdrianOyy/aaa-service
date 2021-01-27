'use strict';
const nodemailer = require('nodemailer');

module.exports = app => {
  return class extends app.Service {
    async sentMail(to, subject, html) {
      const transporter = nodemailer.createTransport(app.config.mailer);

      const mailOptions = {
        from: app.config.mailer.auth.user, // 发送人
        to, // 收件人
        cc: null, // 抄送人
        subject, // Subject line
        html, // html body
      };
      const info = await transporter.sendMail(mailOptions);
      return info;
    }

    async getGrouptoEmail(checkName) {
      const { ctx } = this;
      if (app.config.mailGroup[checkName]) {
        const groupNames = app.config.mailGroup[checkName].split(',');
        if (groupNames.length > 0) {
          const groups = await ctx.service.adService.getUsersForGroup(groupNames);
          // eslint-disable-next-line no-empty
          for (const user of groups) {
            if (user.mail) {
              this.sentMail(user.mail, `${checkName}`, `${checkName} html`);
            }
          }
        }
      }

    }

    async sentT3bySkile(childDataList) {
      for (const child of childDataList) {
        if (child.status && child.status.value === 'skip') {
          if (child.checkName && child.checkName.value) {
            switch (child.checkName.value) {
              case 'T1':
                await this.getGrouptoEmail(child.checkName.value);
                break;
              case 'T2':
                await this.getGrouptoEmail(child.checkName.value);
                break;
              case 'T6':
                await this.getGrouptoEmail(child.checkName.value);
                break;
              default:
                break;
            }
          }
        }
      }
    }
  };
};
