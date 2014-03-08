var http = require('http')
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var frdb = require('./frederickRobinsonDB');
var root = 'data/'

function get(url, writer) {
  frdb.PoliticalParty.find({ID:1}, function (err, politicalParties) {
    if (err) {
      throw err;
    }
    writeSingleOrArray(writer, politicalParties);
  });
}

function writeSingleOrArray(writer, array) {
  if (array.length == 1) {
    writer(array[0]);
  }
  else {
    writer(array);
  }
}

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
      get(url, function(content) {
        res.end(JSON.stringify(content));
      });
      break;
  }
});

frdb.connect(fs,function() {
  server.listen(3000);
});
