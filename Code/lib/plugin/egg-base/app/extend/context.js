'use strict';

module.exports = {
  success(data) {
    this.body = {
      success: true,
      data,
    };
  },
  error(msg) {
    const message = msg || 'bad request';
    throw { status: 400, message };
  },
  async returnListWithCount(promise) {
    try {
      const { count: total, rows: data } = await promise;
      this.status = 200;
      this.body = { status: data.length ? 200 : 204, total, data };
    } catch (e) {
      console.log(e);
      if (e.status && e.code && e.message) throw e;
      switch (e.name) {
        default:
          throw { status: 500 };
      }
    }
  },
};
