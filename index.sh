#!/bin/bash
cwd=$(pwd)   
file_dpi=$1
work_dir=$2

cd "$work_dir"
$cwd/bin/pdftohtml -p -xml -hidden index.pdf
$cwd/bin/pdftoppm -jpeg -r $file_dpi index.pdf jpeg-page
$cwd/bin/pdftoppm -jpeg -r $file_dpi -scale-to-x 1600 index.pdf jpeg-1600-page
