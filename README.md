# pdf-extract-s3
AWS Lambda for extracting PDF to s3

## Pseudo Code/Logic
1) Download pdf to /tmp folder - since AWS Lambda is readonly file system
2) Use the file name as folder and rename file to index.pdf as a convention
3) Run poppler to:
  * extract embedded images with pattern: index-#pagenumber_#imagenumber.jpg
  * extract text and coordinates to: index.xml
  * convert pdf to jpg with pattern: jpeg-page-#pagenumber.jpg
  * convert pdf to svg with pattern: svg-page-#pagenumber.svg
4) Upload to predefined s3 bucket - see Configuration

## Input/Parameters
This can come in as query string in API Gateway.

### url
Required.  The url of pdf to download.

### dest
Optional.  The destination path to store into your bucket.
Default is url path.

### dpi
Optional.  The dpi of the output jpeg.
Default is 150 for smaller web size.

## Output
1) Error message as string.
2) JSON result: {
  path: the path for directory listing,
  files: array of all files
}

## Configuration
Lambda method must have access to specific s3 bucket.

### AWS_DEFAULT_BUCKET
Environment variable of destination bucket which can be configured in AWS API Gateway.

## To build your own poppler:
1) Start an AWS EC2 micro instance
2) Follow instruction: https://github.com/pjfoley/poppler-for-lambda
3) Edit: build.sh and update poppler version to latest: poppler-0.37.0.tar.xz to poppler-0.45.0.tar.xz or latest.
4) Run yum update below to get cairo, jpeg, and png libs before build.
```
sudo yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel libpng-devel
```

## AWS API Gateway body mapping template
application/json -> Select -> Method Request passthrough
