# pdf-extract-s3
AWS Lambda for extracting PDF to s3

```
sudo yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel libpng-devel
```

application/json body mapping template
```
{
  "method": "$context.httpMethod",
  "body" : $input.json('$'),
  "headers": {
    #foreach($param in $input.params().header.keySet())
    "$param": "$input.params().header.get($param)" 
    #if($foreach.hasNext),#end
    #end
  },
  "queryParams": {
    #foreach($param in $input.params().querystring.keySet())
    "$param": "$input.params().querystring.get($param)" #if($foreach.hasNext),#end
 
    #end
  },
  "pathParams": {
    #foreach($param in $input.params().path.keySet())
    "$param": "$input.params().path.get($param)"
    #if($foreach.hasNext),#end
    #end
  }
}
```