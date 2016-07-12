#!/bin/bash
cwd=$(pwd)   
file_dpi=$1
work_dir=$2

cd "$work_dir"
$cwd/bin/pdftoppm -jpeg -r $file_dpi -scale-to-x 1600 index.pdf jpeg-1600-page
$cwd/bin/pdftohtml -p -xml -hidden index.pdf
$cwd/bin/pdftoppm -r 300 index.pdf ppm-page
