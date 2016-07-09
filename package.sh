#!/bin/sh
rm -rf dist/
mkdir dist
zip dist/index.zip index.js index.sh bin/* lib/*
