#!/bin/bash
cwd=$(pwd)    
url=$1
file_name=$2
file_dpi=$3
bucket_path=$4
bucket=$5

cd "$bucket_path"
$cwd/bin/pdftohtml -p -xml -hidden "$file_name"
$cwd/bin/pdftoppm -jpeg -r $file_dpi "$file_name" page
