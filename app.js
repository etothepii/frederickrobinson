var http = require('http')
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var querystring = require('querystring');
var frdb = require('./frederickRobinsonDB');
var root = 'data/'

function get(url, process) {
  var pathParts = url.pathname.slice(1).split("/");
  var table = getTable(pathParts[0]);
  if (table == null) {
    process("Unknown Table: " + pathParts[0]);
  }
  else if (pathParts.length == 1) {
    var search = querystring.parse(url.query);
    table.find(search, process);
  }
  else if (pathParts.length == 2) {
    var id = parseInt(pathParts[1]);
    getFromId(table, id, process);
  }
}

function getTable(tableName) {
  switch (tableName) {
    case 'agent':
      return frdb.Agent;
    case 'candidate':
      return frdb.Candidate;
    case 'count':
      return frdb.Count;
    case 'overseeing':
      return frdb.Overseeing;
    case 'politicalParty':
      return frdb.PoliticalParty;
    case 'pollingArea':
      return frdb.PollingArea;
    case 'tally':
      return frdb.Tally;
    case 'user':
      return frdb.User;
    default:
      return null;
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
