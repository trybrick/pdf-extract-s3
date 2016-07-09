'use strict';
let exec = require('child_process').exec;
let urlParse = require('url');
let cfg = {
  bucket: process.env['ResultBucket'] || 'brick-web'
};

exports.handler = (event, context, callback) => {
  event.url = (event.url || event.queryParams.url) + '';

  if (!/^(http|https)\:\/\//gmi.test(event.url)) {
    context.fail('URL is invalid.');
    return;
  }

  event.dpi = parseInt(event.dpi || event.queryParams.dpi);
  if (!event.dpi) {
    event.dpi = 150;
  }

  var fileName = path.basename(event.url);
  var opt = urlParse.parse(event.url, true);
  var destPath = path.dirname(opt.path);
  var destBucket = `${cfg.bucket}${destPath}`;
  var cmd = `./index.sh "${event.url}" "${fileName}" "${event.dpi}" "${destBucket}"`;
  console.log('executing: ', cmd);
  const child = exec(cmd, (error) => {
    // Resolve with result of process
    callback(error, 'Process complete!');
  });

  // Log process stdout and stderr
  child.stdout.on('data', console.log);
  child.stderr.on('data', console.error);
};
