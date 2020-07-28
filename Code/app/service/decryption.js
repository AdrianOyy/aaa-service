
const crypto = require('crypto');

module.exports = app => {
  return class extends app.Service {
    async decrypteds (encrypted) {
      let decrypted = "";
      const decipher = crypto.createDecipher("aes-256-cbc", "MzZaFw0yNDA2MDYwNzI4MzZaMIGIMQswCQYDVQQGEwJDTjERMA8GA1UECAwIU2hh");
      decrypted += decipher.update(encrypted, 'hex', 'binary');
      decrypted += decipher.final('binary');
      return decrypted;
    }
  }
}
