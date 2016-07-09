'use strict';
let fs = require('fs');
let AWS = require('aws-sdk');
let mime = require('mime');
let s3 = new AWS.S3();

module.exports = {
  upload: (bucket, key, file, cb) => {
    var outfile = null,
      mimetype = null,
      stream = null;
    var fileName = file;

    if (file.indexOf('/svg-page') > 0 && file.indexOf('.svg') < 0) {
      fileName = file + '.svg';
      key = key + '.svg';
    }

    try {
      stream = fs.createReadStream(file);
    } catch (e) {
      console.log(e);
      return cb(e);
    }

    try {
      mimetype = mime.lookup(fileName) || 'application/octet-stream';
    } catch (e) {
      console.log(e);
      return cb(e);
    }

    s3.putObject({
      'Bucket': bucket,
      'Key': key,
      'Body': stream,
      'ContentType': mimetype
    }, function(err, data) {
      if (err) {
        console.log(err);
        return cb(err);
      }

      cb();
    });
  }
}
