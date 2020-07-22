'use strict';

const ActiveDirectory = require('activedirectory2');
const config = { url: 'ldap://10.220.130.220',
  baseDN: 'dc=apj,dc=com',
  username: 'qiwei',
  password: 'APJ.com123' };
const ad = new ActiveDirectory(config);

module.exports = app => {

  return class extends app.Service {

    async authenticate(username, password) {
      const result = await new Promise(resolve => {
        ad.authenticate(username, password, function(err, auth) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(false);
          } else if (auth) {
            resolve(auth);
          } else {
            resolve(auth);
          }
        });
      });
      return result;
    }

    /**
     * 查询
     * @param {*} opts 默认为[]
     */
    async find(opts = null) {
      // const { ctx } = this;
      const result = await new Promise(resolve => {
        opts === null ? ad.find(function(err, results) {
          if ((err) || (!results)) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          } else {
            resolve(results);
          }
          return results;
        }) : ad.find(opts, function(err, results) {
          if ((err) || (!results)) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          } else {
            resolve(results);
          }
          return results;
        });
      });
      // results.groups results.users results.other
      // console.log('find', result.users[0]);
      return result;
      // await ctx.model.models.syncUser.create({});
    }

    async findUser(username, opts = null) {
      const result = await new Promise(resolve => {
        opts === null ? ad.findUser(username, function(err, users) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          if (!users) {
            resolve(null);
          } else {
            resolve(users);
          }
          return users;
        }) : ad.findUser(opts, username, function(err, users) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          if (!users) {
            resolve(null);
          } else {
            resolve(users);
          }
          return users;
        });
      });
      return result;
    }

    async findUsers(opts = null) {
      const result = await new Promise(resolve => {
        opts === null ? ad.findUsers(function(err, users) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          if (!users) {
            resolve(null);
          } else {
            resolve(users);
          }
          return users;
        }) : ad.findUsers(opts, function(err, users) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          if (!users) {
            resolve(null);
          } else {
            resolve(users);
          }
          return users;
        });
      });
      return result;
    }

    async findGroup(groupName, opts = null) {
      const result = await new Promise(resolve => {
        opts === null ? ad.findGroup(groupName, function(err, group) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          if (!group) {
            resolve(null);
          } else {
            resolve(group);
          }
          return group;
        }) : ad.findGroup(opts, groupName, function(err, group) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          if (!group) {
            resolve(null);
          } else {
            resolve(group);
          }
          return group;
        });
      });
      return result;
    }

    async findGroups(opts = null) {
      const result = await new Promise(resolve => {
        opts === null ? ad.findGroups(function(err, group) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          if (!group) {
            resolve(null);
          } else {
            resolve(group);
          }
          return group;
        }) : ad.findGroups(opts, function(err, group) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          if (!group) {
            resolve(null);
          } else {
            resolve(group);
          }
          return group;
        });
      });
      return result;
    }

    async getGroupMembershipForUser(username, opts = null) {
      const result = await new Promise(resolve => {
        opts === null ? ad.getGroupMembershipForUser(username, function(err, groups) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          if (!groups) {
            resolve(null);
          } else {
            resolve(groups);
          }
          return groups;
        }) : ad.getGroupMembershipForUser(opts, username, function(err, groups) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          if (!groups) {
            resolve(null);
          } else {
            resolve(groups);
          }
          return groups;
        });
      });
      return result;
    }

    async userExists(username, opts = null) {
      const result = await new Promise(resolve => {
        opts === null ? ad.userExists(username, function(err, exists) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          resolve(exists);
        }) : ad.userExists(opts, username, function(err, exists) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          resolve(exists);
        });
      });
      return result;
    }

    async groupExists(groupName) {
      const result = await new Promise(resolve => {
        ad.groupExists({}, groupName, function(err, exists) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          resolve(exists);
        });
      });
      return result;
    }

    async isUserMemberOf(username, groupName, opts = null) {
      const result = await new Promise(resolve => {
        opts === null ? ad.isUserMemberOf(username, groupName, function(err, isMember) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          resolve(isMember);
        }) : ad.isUserMemberOf(opts, username, groupName, function(err, isMember) {
          if (err) {
            console.error('ERROR: ' + JSON.stringify(err));
            resolve(null);
          }
          resolve(isMember);
        });
      });
      return result;
    }
  };
};
