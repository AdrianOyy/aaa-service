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

    async sentMailTask(from, to, cc, subject, html) {
      const transporter = nodemailer.createTransport(app.config.mailer);

      const mailOptions = {
        from: from ? from : app.config.mailer.auth.user, // 发送人
        to, // 收件人
        cc, // 抄送人
        subject, // Subject line
        html, // html body
      };
      const info = await transporter.sendMail(mailOptions);
      return info;
    }

    async getBody(checkName, tenantName, justification, displayname) {
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
          '<div style="margin-top: 10px;">Requester: ' + displayname + '</div>' +
          '<div style="margin-top: 10px;">Project: ' + tenantName + '</div>' +
          '<div style="margin-top: 10px;">Justification: ' + justification + '</div>' +
          '<br />' +
          '<div style="margin-top: 10px;">Please click the link to view details.</div>' +
          '<div style="margin-top: 10px;">' +
              '<a href="' + app.config.mailGroup.frontEndUrl + '" target="_blank">' + app.config.mailGroup.frontEndUrl + '</a>' +
          '</div>' +
          '<br />' +
          '<div style="margin-top: 10px;">Regards,</div>' +
          '<div style="margin-top: 10px;">HO IT&HI ISD SENSE Platform on behalf of T3 Team</div>' +
          '</body>' +
          '</html>';
      return html;
    }

    async getGrouptoEmail(checkName, tenantName, justification, displayname) {
      const { ctx } = this;
      if (app.config.mailGroup[checkName]) {
        const groupNames = app.config.mailGroup[checkName].split(',');
        if (groupNames.length > 0) {
          const groups = await ctx.service.adService.getUsersForGroup(groupNames);
          // eslint-disable-next-line no-empty
          for (const user of groups) {
            if (user.mail) {
              const html = await this.getBody(checkName, tenantName, justification, displayname);
              this.sentMail(user.mail, 'A VM allocation request is pending for your handle.', html);
            }
          }
        }
      }

    }

    async sentT3bySkile(childDataList, parentData) {
      const { ctx } = this;
      for (const child of childDataList) {
        if (child.status && child.status.value === 'skip') {
          const tenant = await ctx.model.models.tenant.findOne({ where: { id: parentData.tenant.value } });
          const tenantName = tenant ? tenant.name : '';
          const justification = parentData.justification ? parentData.justification.value : '';
          const user = await ctx.model.models.user.findOne({ where: { id: parentData.createBy.value } });
          const displayname = user ? user.displayname : '';
          if (child.checkName && child.checkName.value) {
            switch (child.checkName.value) {
              case 'T1':
                await this.getGrouptoEmail(child.checkName.value, tenantName, justification, displayname);
                break;
              case 'T2':
                await this.getGrouptoEmail(child.checkName.value, tenantName, justification, displayname);
                break;
              case 'T6':
                await this.getGrouptoEmail(child.checkName.value, tenantName, justification, displayname);
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
