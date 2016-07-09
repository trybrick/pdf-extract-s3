#!/bin/bash
cwd=$(pwd)   
file_name=$1
file_dpi=$2
bucket_path=$3

cd "$bucket_path"
$cwd/bin/pdftohtml -p -xml -hidden "$file_name"
$cwd/bin/pdftoppm -jpeg -r $file_dpi -scale-to-x 1600 "$file_name" jpeg-page
$cwd/bin/pdftocairo -svg "$file_name" svg-page
