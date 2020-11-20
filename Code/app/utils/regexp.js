'use strict';

function isInt(str) {
  const reg = new RegExp(/^[0-9]*$/);
  return reg.test(str);
}

module.exports = {
  isInt,
};
