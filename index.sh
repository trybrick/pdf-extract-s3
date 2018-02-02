#!/bin/bash
cwd=$(pwd)   
file_dpi=$1
work_dir=$2
width=$3
filename=$4

cd "$work_dir"
$cwd/bin/pdftoppm -jpeg -r $file_dpi -scale-to-x 1000 -scale-to-y -1 index.pdf jpeg-1000-page
$cwd/bin/pdftoppm -jpeg -r $file_dpi -scale-to-x $width -scale-to-y -1 index.pdf "jpeg-$width-page"
$cwd/bin/pdftohtml -p -xml -hidden index.pdf
$cwd/bin/pdftoppm -r $file_dpi index.pdf ppm-page
cp -f jpeg-1000-page-1.jpg index.jpg || true
cp -f jpeg-1000-page-1.jpg "$filename" || true
