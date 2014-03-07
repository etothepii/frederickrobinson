var http = require('http')
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var root = 'data/'

var server = http.createServer(function(req, res) {
  var url = parse(req.url);
  var path = join(root, url.pathname + ".json");
  switch (req.method) {
    case 'POST':
      var content = '';
      req.setEncoding('utf8');
      req.on('data', function(chunk) {
        content += chunk;
      });
      req.on('end', function() {
        fs.writeFile(path,content,function(err) {
	  if (err) {
	    res.end(err + "\n");
	  }
	  else {
	    res.end("OK\n");
	  }
	});
      });
      break;
    case 'GET':
      var stream = fs.createReadStream(path);
      stream.on('error', function(err) {
        console.error(err);
        res.end(JSON.stringify(err) + "\n");
      });
      stream.on('data', function(chunk) {
        res.write(chunk);
      });
      stream.on('end', function() {
        res.end();
      });
      break;
  }
});

server.listen(3000);
