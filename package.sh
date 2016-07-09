#!/bin/sh
rm -rf dist/
mkdir dist
zip -r dist/index.zip index.js index.sh s3.js bin/* lib/* node_modules/* node_modules/.*
