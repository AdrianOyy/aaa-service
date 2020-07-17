'use strict';

// const UPLOAD = Symbol('Application#upload');

const fs = require('fs');
const path = require('path');

module.exports = options => {
  return async function upload(ctx, next) {
    // 获取路径、文件夹
    const { bucket, baseDir } = options;
    // 检查路径
    if (!fs.existsSync(baseDir)) {
      throw { status: 500, message: 'base path doesn\'t exist' };
    }
    // 检查文件夹
    const fullPath = path.join(baseDir, bucket);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }
    const parts = ctx.multipart();
    let part;
    ctx.request.body.fileList = [];
    while ((part = await parts()) != null) {
      if (part.length) {
        // arrays are busboy fields
        // console.log('field: ' + part[0]);
        // console.log('value: ' + part[1]);
        // console.log('valueTruncated: ' + part[2]);
        // console.log('fieldnameTruncated: ' + part[3]);
      } else {
        if (!part.filename) {
          // user click `upload` before choose a file,
          // `part` will be file stream, but `part.filename` is empty
          // must handler this, such as log error.
          throw { status: 400, message: 'filename is empty' };
        }
        // otherwise, it's a stream
        // console.log('field: ' + part.fieldname);
        // console.log('filename: ' + part.filename);
        // console.log('encoding: ' + part.encoding);
        // console.log('mime: ' + part.mime);
        try {
          const extname = path.extname(part.filename);
          const fileName = new Date().getTime() + extname;
          part.savedName = fileName;
          part.savedDir = fullPath;
          const filePath = path.join(fullPath, fileName);
          await saveStream(part, filePath);
        } catch (err) {
          console.log('err==========================err');
          console.log(err);
          console.log('err==========================err');
          throw { status: 500, message: '上传失败' };
        } finally {
          ctx.request.body.fileList.push(part);
        }
      }
    }
    next();
  };
};


function saveStream(stream, filepath) {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(filepath);
    stream.pipe(ws);
    ws.on('error', reject);
    ws.on('finish', resolve);
  });
}
