'use strict';
const nodemailer = require('nodemailer');

module.exports = app => {
  return class extends app.Service {
    async sentMail(from, to, subject, html) {
      console.log(app.config.mailer);
      const transporter = nodemailer.createTransport(app.config.mailer);

      const mailOptions = {
        from, // 发送人
        to, // 收件人
        cc: null, // 抄送人
        subject, // Subject line
        html, // html body
      };
      const info = await transporter.sendMail(mailOptions);
      return info;
    }

    async testMail() {
      await this.sentMail('lukeli@apjcorp.com', 'lukeli@apjcorp.com', 'ttt222222222', '尊敬的 APJ 员工【李拓新】,您的账号【lukeli】重置密码成功，新密码为：343');
    }

    async sentT3bySkile(childDataList) {
      for (const child of childDataList) {
        if (child.status.value === 'skip') {
          await this.sentMail('lukeli@apjcorp.com', 'rexshen@apjcorp.com', 't1/t2/t6test', 't1/t2/t6 test mailer');
        }
      }
    }
  };
};
