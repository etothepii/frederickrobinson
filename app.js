var http = require('http')
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var frdb = require('./frederickRobinsonDB');
var root = 'data/'

function get(url, writer) {
  var pathParts = url.pathname.slice(1).split("/");
  if (pathParts.length == 2) {
    getFromId(pathParts[0], parseInt(pathParts[1]), writer);
  }
}

function getFromId(table, id, writer) {
  switch (table) {
    case 'pollingArea':
      frdb.PollingArea.find({ID:id}, function (err, pollingAreas) {
        if (err) {
	  throw err;
	}
	writeSingleOrArray(writer, pollingAreas);
      });
    case 'politicalParty':
      var search;
      if (id == 0) {
        search = {};
      }
      else {
        search = {ID: id};
      }
      frdb.PoliticalParty.find(search, function (err, parties) {
        if (err) {
          throw err;
        }   
        writeSingleOrArray(writer, parties);
      }); 
  }
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
  res.setHeader('Content-Type', 'application/json; charset="utf-8"');
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
