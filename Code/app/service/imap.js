'use strict';

const jwt = require('jsonwebtoken');
const Imap = require('imap');

// const inspect = require('util').inspect;
const user = process.env.npm_config_imapUser;
const password = process.env.npm_config_imapPass;
const host = process.env.npm_config_imapHost;
const port = process.env.npm_config_imapPort;
const impaConfig = {
  user,
  password,
  host,
  port,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};
const imapFlag = process.env.npm_config_imapFlag;
if (imapFlag && imapFlag === 'Y') {
  console.log(impaConfig);
}

module.exports = app => {
  return class extends app.Service {
    async createBox() {
      const imap = new Imap(impaConfig);
      imap.once('ready', function() {
        imap.getBoxes('**', function(err, boxes) {
          if (err) throw err;
          if (!boxes.Other) {
            imap.addBox('Other', function() {
              console.log('Add Other Box');
            });
          }
          if (!boxes.Completed) {
            imap.addBox('Completed', function() {
              console.log('Add Completed Box');
            });
          }
          if (!boxes['Incorrect Approval']) {
            imap.addBox('Incorrect Approval', function() {
              console.log('Add Incorrect Approval Box');
            });
          }
          imap.end();
        });
      });
      imap.connect();
    }

    async fetchMessages() {
      const imap = new Imap(impaConfig);
      return new Promise(function(resolve) {

        imap.once('ready', function() {
          imap.openBox('INBOX', true, function(err, box) {
            if (err) throw err;
            const f = imap.seq.fetch('0:' + box.messages.total, {
              bodies: [ '' ],
              struct: true,
            });
            const messages = [];
            f.on('message', function(msg) {
              const messsage = {};
              msg.on('body', function(stream) {
                stream.on('data', function(chunk) {
                  try {
                    const message = chunk.toString('utf8');
                    // get from
                    const headers = Imap.parseHeader(message);
                    let from = headers.from[0];
                    if (from.indexOf('<') !== -1) {
                      from = from.slice(from.indexOf('<') + 1, from.indexOf('>'));
                    }
                    messsage.from = from;
                    if (message.indexOf('Action:[Approve]') !== -1) {
                      messsage.action = 'Approve';
                    } else if (message.indexOf('Action:[Reject]') !== -1) {
                      messsage.action = 'Reject';
                    }
                    // get taskId
                    const msg = message.split('***************************************************************');
                    if (messsage.action === 'Reject') {
                      const rejectString = msg[0];
                      const rejectReason = rejectString.slice(rejectString.indexOf('in the colon:') + 'in the colon:'.length, rejectString.indexOf('(reason end)'));
                      messsage.rejectReason = rejectReason;
                    }
                    const taskIdString = msg[msg.length - 1];
                    let taskId = taskIdString.slice(taskIdString.indexOf('[') + 1, taskIdString.indexOf(']'));
                    taskId = taskId.replace(new RegExp(/\r|\n|\\s/, 'gm'), '');
                    if (taskId.length === 171) {
                      messsage.taskId = taskId;
                    } else {
                      messsage.error = true;
                    }
                  } catch (error) {
                    messsage.error = true;
                  }
                });
              });
              msg.once('attributes', function(attrs) {
                messsage.uid = attrs.uid;
              });
              msg.once('end', function() {
                messages.push(messsage);
              });
            });
            f.once('error', function(err) {
              console.log('Fetch error: ' + err);
            });
            f.once('end', function() {
              imap.end();
              resolve(messages);
            });
          });
        });
        imap.once('error', function(err) {
          console.log(err);
        });
        imap.connect();
      });
    }

    async moveTo(folders) {
      const imap = new Imap(impaConfig);

      imap.once('ready', function() {
        imap.openBox('INBOX', false, function(err) {
          if (err) throw err;
          for (const _ of folders) {
            if (_.uids && _.uids.length > 0 && _.boxTo) {
              imap.move(_.uids, _.boxTo, function() {});
            }
          }
          imap.end();
        });
      });
      imap.once('error', function(err) {
        console.log(err);
      });
      imap.connect();
    }

    async getActionMessageAndOtherUIDS(ctx, messages) {
      // get all users
      const users = await ctx.model.models.user.findAll({
        raw: true,
        attributes: [ 'email', 'sAMAccountName' ],
      });
      const otherUIDS = [];
      messages.map(_ => {
        // check email
        for (const user of users) {
          if (!_.error && _.from === user.email) {
            _.name = user.sAMAccountName;
            break;
          }
        }
        if (!_.error && (!_.name || !_.taskId)) {
          _.error = true;
        } else if (!_.error && _.name) {
          // check taskId
          try {
            const { message } = jwt.decode(_.taskId, app.config.jwt.secret);
            _.taskId = message.replace('taskId:', '');
          } catch (error) {
            _.error = true;
          }
        }
        if (_.error) {
          otherUIDS.push(_.uid);
        }
        return _;
      });
      return {
        actionMessage: {
          actionMessages: messages.filter(_ => !_.error),
        },
        otherUIDS,
      };
    }

    async getFolders(result, otherUIDS) {
      const folders = [];
      if (otherUIDS && otherUIDS.length > 0) {
        folders.push({
          uids: otherUIDS,
          boxTo: 'Other',
        });
      }
      const completedUIDS = [];
      const incorrectUIDS = [];
      if (result.status === 200 && result.data) {
        for (const _ of result.data) {
          if (_.result) {
            completedUIDS.push(parseInt(_.uid));
          } else {
            incorrectUIDS.push(parseInt(_.uid));
          }
        }
        if (completedUIDS.length > 0) {
          folders.push({
            uids: completedUIDS,
            boxTo: 'Completed',
          });
        }
        if (incorrectUIDS.length > 0) {
          folders.push({
            uids: incorrectUIDS,
            boxTo: 'Incorrect Approval',
          });
        }
      }

      return folders;
    }

  };
};
