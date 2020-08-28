'use strict';

module.exports = app => {
  return class extends app.Service {
    /**
     * @param {Object[]} IPList IP list without hostname
     * @param {number} num number of requested IP
     * @returns {Object[]}
     */
    async getClosest(IPList, num) {
      const IPNumArr = [];
      for (let i = 0; i < IPList.length; i++) {
        IPNumArr.push(IP2Num(IPList[i].IP));
      }
      const distanceList = [];
      for (let i = 1; i < IPNumArr.length; i++) {
        distanceList.push(IPNumArr[i] - IPNumArr[i - 1]);
      }
      let startNum = 0;
      const windowWidth = num - 2;
      // 滑动窗口
      for (let i = 1; i < distanceList.length - windowWidth + 1; i++) {
        if (distanceList[i - 1] > distanceList[i + windowWidth - 1]) {
          startNum = i;
        }
      }
      const closestList = [];
      let front = startNum + num - distanceList.length - 1;
      if (front < 0) front = 0;
      for (let i = startNum - front; i < startNum + num - front; i++) {
        closestList.push(IPList[i]);
      }
      return closestList;
    }

    async assign(DC, requestNum) {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const IPList = await ctx.model.models.ip_assignment.findAll({
        where: {
          DC,
          hostname: { [Op.is]: null },
        },
        attributes: [ 'id', 'IP' ],
        order: [[ 'IP', 'ASC' ]],
      });
      if (IPList.length < requestNum) {
        return false;
      } else if (IPList.length === parseInt(requestNum)) {
        return IPList;
      } else if (parseInt(requestNum) === 1) {
        return [ IPList[0] ];
      }
      const closestList = await this.getClosest(IPList, parseInt(requestNum));
      if (!closestList) return false;
      return closestList;
    }
  };
};

/**
 * @param {string} IP IP address
 * @returns {number}
 */
function IP2Num(IP) {
  const IPArr = IP.split('.');
  return (
    parseInt(IPArr[0]) * Math.pow(255, 3) +
    parseInt(IPArr[1]) * Math.pow(255, 2) +
    parseInt(IPArr[2]) * Math.pow(255, 1) +
    parseInt(IPArr[3])
  );
}
