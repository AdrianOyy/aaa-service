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

    async getBody(checkName) {
      let html = '<!DOCTYPE html>' +
      '<html xmlns="http://www.w3.org/1999/xhtml">' +
      '<head>' +
      '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
      '<title></title>' +
      '</head>' +
      '<body>' +
      '<div style="margin-top: 10px;">Dear ' + checkName + ' support,</div><br />';
      switch (checkName) {
        case 'T1':
          html += '<div style="margin-top: 10px;">Please handle project code creation for the following provisioning request:</div>';
          break;
        case 'T2':
          html += '<div style="margin-top: 10px;">Please handle the following Linux VM provisioning request:</div>';
          break;
        case 'T6':
          html += '<div style="margin-top: 10px;">Please handle the following Cloud namespace provisioning request:</div>';
          break;
        default:
          break;
      }
      html += '<br />' +
          '<div style="margin-top: 10px;">' +
              '<a href="' + app.config.mailGroup.Lint + '" target="_blank">' + app.config.mailGroup.Lint + '</a>' +
          '</div>' +
          '<br />' +
          '<div style="margin-top: 10px;">Regards,</div>' +
          '<div style="margin-top: 10px;"><span style="color:red">HO IT&HI ISD</span> SENSE <span style="color:red">Platform</span> on behalf of T3 team</div>' +
          '</body>' +
          '</html>';
      return html;
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
              const html = await this.getBody(checkName);
              this.sentMail(user.mail, 'A VM allocation request is pending for your handle.', html);
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
