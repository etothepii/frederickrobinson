var http = require('http')
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var frdb = require('./frederickRobinsonDB');
var root = 'data/'

function get(url, process) {
  var pathParts = url.pathname.slice(1).split("/");
  if (pathParts.length == 2) {
    var id = parseInt(pathParts[1]);
    switch (pathParts[0]) {
      case 'agent':
        getFromId(frdb.Agent, id, process);
	break;
      case 'candidate':
        getFromId(frdb.Candidate, id, process);
	break;
      case 'count':
        getFromId(frdb.Count, id, process);
	break;
      case 'overseeing':
        getFromId(frdb.Overseeing, id, process);
	break;
      case 'politicalParty':
        getFromId(frdb.PoliticalParty, id, process);
	break;
      case 'pollingArea':
        getFromId(frdb.PollingArea, id, process);
	break;
      case 'tally':
        getFromId(frdb.Tally, id, process);
	break;
      case 'user':
        getFromId(frdb.User, id, process);
	break;
      default:
        process("Unknown table: " + pathParts[0]);
	break;
    }
  }
}

function getFromId(table, id, process) {
  var search;
  if (id == 0) {
    search = {};
  }
  else {
    search = {ID: id};
  }
  table.find(search, process);
}


function writeSingleOrArray(array, writer) {
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
      get(url, function(err, array) {
        if (err) {
	  res.statusCode = 404;
	  res.end(JSON.stringify(err));
	}
	else {
          writeSingleOrArray(array, function (content) {
            res.end(JSON.stringify(content));
          });
	}
      });
      break;
  }
});

frdb.connect(fs,function() {
  server.listen(3000);
});
