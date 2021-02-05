module.exports = () => {
  return async function errorLog(ctx, next) {
    try {
      await next();
    } catch (error) {
      console.log(new Date(), '\tError!');
      console.log('====================================================================================================');
      console.log(error);
      console.log('====================================================================================================');
      ctx.logger.error(error);
      ctx.error();
    }
  };
};
