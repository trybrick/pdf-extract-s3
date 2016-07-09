'use strict';
let exec = require('child_process').exec;
let urlParse = require('url');
let path = require('path');
let cfg = {
  bucket: process.env['AWS_DEFAULT_BUCKET'] || 'brick-web',
  basepath: '/tmp/pdf'
};
let request = require('request');
let mkdirp = require('mkdirp');
let fs = require('fs');
let recursiveReadSync = require('recursive-readdir-sync');
let async = require('async');

var processUrl = (event, context, callback) => {
  console.log('executing: ', event.cmd);
  const child = exec(event.cmd, (error) => {
    // Resolve with result of process
    callback(error, 'Process complete!');
  });

  // Log process stdout and stderr
  child.stdout.on('data', console.log);
  child.stderr.on('data', console.error);
}

var doUpload = (event, context, callback) => {
  var files = [];
  try {
    files = recursiveReadSync(`${cfg.basepath}/`);
  } catch(err){
    files = [];
    callback(err);
    return;
  }
  console.log('files: ', files.length);

  if (files.length <= 0) {
    callback();
    return;
  }

  let s3 = require('./s3.js');
  var q = async.queue(function (f,cb) {
    // console.log('uploading: ', f, cfg.bucket);
    s3.upload(cfg.bucket, f.replace('/tmp/', '').toLowerCase(), f, cb);
  }, 10);

  q.drain = callback;

  for(var i = 0; i < files.length; i++) {
    q.push(files[i]);
  }
}

exports.handler = (event, context, callback) => {
  event.url = (event.url || (event.queryParams || {}).url) + '';
  console.log('url: ', event.url);

  if (!/^(http|https)\:\/\//gmi.test(event.url)) {
    context.fail('URL is invalid.');
    return;
  }

  event.url = decodeURI(event.url);
  event.dpi = parseInt(event.dpi || (event.queryParams || {}).dpi);
  if (!event.dpi) {
    event.dpi = 150;
  }

  var opt = urlParse.parse(event.url, true);
  var pathName = cfg.basepath + opt.pathname;
  var destPath = path.dirname(pathName);
  var fileName = pathName.replace(destPath + '/', '');
  event.cmd = `./index.sh "${event.url}" "${fileName}" "${event.dpi}" "${destPath}" ` + cfg.bucket;
  mkdirp.sync(destPath);
  request({uri: event.url})
      .pipe(fs.createWriteStream(pathName))
      .on('close', function() {
        processUrl(event, context, (err) => {
          doUpload(event, context, callback);
        });
      });
};
