'use strict';
let exec = require( 'child_process' ).exec;
let urlParse = require( 'url' );
let path = require( 'path' );
let cfg = {
  bucket: process.env[ 'AWS_DEFAULT_BUCKET' ] || 'brick-web',
  basepath: '/tmp/pdf'
};
let request = require( 'request' );
let mkdirp = require( 'mkdirp' );
let fs = require( 'fs' );
let recursiveReadSync = require( 'recursive-readdir-sync' );
let async = require( 'async' );
let AWS = require( 'aws-sdk' );
let s3signer = new AWS.S3();

var doTransform = ( event, context, callback ) => {
  console.log( 'executing: ', event.cmd );
  const child = exec( event.cmd, ( error ) => {
    // Resolve with result of process
    callback( error, 'Process complete!' );
  } );

  // Log process stdout and stderr
  child.stdout.on( 'data', console.log );
  child.stderr.on( 'data', console.error );
}

var doUpload = ( event, context, callback ) => {
  var files = [],
    rstFiles = [];
  try {
    files = recursiveReadSync( `${cfg.basepath}/` );
  } catch ( err ) {
    files = [];
    callback( err );
    return;
  }
  console.log( 'files: ', files.length );

  if ( files.length <= 0 ) {
    callback();
    return;
  }

  console.log( 'begin upload to bucket: ', cfg.bucket );

  let s3 = require( './s3.js' );
  var q = async.queue( function ( f, cb ) {
    var myKey = f.replace( '/tmp/', '' );

    rstFiles.push( myKey );
    // console.log( 'uploading: ', f, cfg.bucket );
    s3.upload( cfg.bucket, myKey, f, cb );
  }, 10 );

  q.drain = ( err, results ) => {
    console.log( 'end upload to bucket: ', cfg.bucket );

    if ( err ) {
      callback( err );
      return;
    }

    var rst = {
      success: true,
      path: event.dest.replace( '/tmp/', '' ),
      files: rstFiles
    };

    callback( null, JSON.stringify( rst, null, 2 ) );
  };

  for ( var i = 0; i < files.length; i++ ) {
    q.push( files[ i ] );
  }
}

exports.handler = ( event, context, callback ) => {
  // if s3 event
  if ( event.Records && event.Records[ 0 ] ) {
    const bucket = event.Records[ 0 ].s3.bucket.name;
    const key = decodeURIComponent( event.Records[ 0 ].s3.object.key.replace( /\+/g, ' ' ) );
    const signedUrlExpireSeconds = 600;

    const url = s3signer.getSignedUrl( 'getObject', {
      Bucket: bucket,
      Key: key,
      Expires: signedUrlExpireSeconds
    } );

    var basePath = path.dirname( '/' + key ).replace( "/archives/FTPRoot/", "/" );

    event.params = {
      querystring: {
        url: url,
        dpi: 72,
        dest: `${bucket}${basePath}`
      }
    }
  }

  // fix params
  event.params = event.params || {};
  event.params.querystring = event.params.querystring || {};

  event.url = ( event.url || event.params.querystring.url ) + '';
  console.log( 'url: ', event.url );

  if ( !/^(http|https)\:\/\//gmi.test( event.url ) ) {
    context.fail( 'URL is invalid.' );
    return;
  }

  event.dpi = parseInt( event.dpi || event.params.querystring.dpi );
  event.width = parseInt( event.width || event.params.querystring.width || 1600 );
  if ( !event.dpi ) {
    event.dpi = 150;
  }

  var opt = urlParse.parse( event.url, true );
  var pathName = decodeURIComponent( opt.pathname );
  var destPath = path.dirname( pathName );
  var fileName = pathName.replace( destPath + '/', '' );
  var legacyName = path.basename( fileName ).replace( ".PDF", "" ).replace( ".pdf", "" );

  event.dest = ( event.dest || event.params.querystring.dest || destPath ) + '';

  // prefix with basepath: /tmp/pdf
  destPath = `${cfg.basepath}/${event.dest}`;

  // use pdf file name as path and download as index.pdf
  event.dest = `${destPath}/${fileName}/`.replace( '.pdf', '/' ).replace( /\/+/gi, '/' );

  // generate shell exec string
  event.cmd = `./index.sh "${event.dpi}" "${event.dest}" ${event.width} "${legacyName}.jpg"`;

  // make directory before download
  mkdirp.sync( event.dest );

  // do download
  request( {
      uri: event.url
    } )
    .pipe( fs.createWriteStream( event.dest + 'index.pdf' ) )
    .on( 'close', function () {
      doTransform( event, context, ( err ) => {
        if ( err ) {
          console.log( err );
          callback( null, err );
          return;
        }

        // do upload if no error
        doUpload( event, context, ( err ) => {
          console.log( err );
          callback( null, err );
        } );
      } );
    } );
};
