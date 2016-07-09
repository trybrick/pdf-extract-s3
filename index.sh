#!/bin/bash    
# the directory of the script
cwd=$(pwd)
# the temp directory used, within $DIR
cd /tmp
WORK_DIR=`mktemp -d -p "/tmp"`
url=$1
file_name=$2
file_dpi=$3
bucket_path=$4

cd $WORK_DIR
wget "$url"

./$DIR/bin/pdftohtml -p -xml -hidden "$file_name"
./$DIR/bin/pdftoppm -jpeg -r $file_dpi "$file_name" page

aws s3 cp . s3://$bucket_path