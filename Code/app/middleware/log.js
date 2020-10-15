'use strict';


module.exports = options => {
  return async (ctx, next) => {
    const startedAt = new Date() - 0;
    const { tsHost } = options;
    await next();
    const { request, response } = ctx;

    const res = {
      status: response.status,
      size: response.size,
      headers: response.headers,
      body: response.body,
    };

    const req = {
      method: request.method,
      uri: request.uri,
      url: request.url,
      size: request.size,
      querystring: request.querystring,
      headers: request.headers,
      body: request.body,
    };

    const message = {
      request: req,
      response: res,
      startedAt,
    };
    post(tsHost, JSON.stringify(message), ctx);
  };
};


function post(url, data, ctx) {
  ctx.curl(url, {
    method: 'POST',
    data,
  });
}
