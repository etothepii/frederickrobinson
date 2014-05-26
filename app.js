var http = require('http')
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var querystring = require('querystring');
var frdb = require('./lib/frederickRobinsonDB');
var counter = require('./lib/counter');
var root = 'data/'

counter.setDB(frdb);

function get(url, process) {
  var pathParts = url.pathname.slice(1).split("/");
  var table = getTable(pathParts[0]);
  if (table == null) {
    process("Unknown / Unsupported Table: " + pathParts[0]);
  }
  else if (pathParts.length == 1) {
    var search = querystring.parse(url.query);
    table.find(search, process);
  }
  else if (pathParts.length == 2) {
    var id = parseInt(pathParts[1]);
    if (pathParts[0] == 'pollingArea') {
      getFromId(table, id, function(err, pollingArea) {
        table.find({PARENT: id}, function(err2, children) {
	  var formattedCorrectly = buildReturnablePollingArea(pollingArea, children);
          process(0, formattedCorrectly);
        });
      });
    }
    else {
      getFromId(table, id, process);
    }
  }
}

function buildReturnablePollingArea(pollingArea, children) {
  var displayChildren = [];
  for (var i = 0; i < children.length; i++) {
    displayChildren.push({"id": children[i].ID, "displayName": children[i].NAME});
  }
  return {
    "id": pollingArea[0].ID,
    "name": pollingArea[0].NAME,
    "childTypeDisplayName": pollingArea[0].CHILD_TYPE,
    "children": displayChildren
  }
}

function getTable(tableName) {
  switch (tableName) {
    case 'agent':
      return frdb.Agent;
    case 'candidate':
      return frdb.Candidate;
    case 'overseeing':
      return frdb.Overseeing;
    case 'politicalParty':
      return frdb.PoliticalParty;
    case 'pollingArea':
      return frdb.PollingArea;
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

function put(url, body, postProcessing) {
  var pathParts = url.pathname.slice(1).split("/");
  switch (pathParts[0]) {
    case "count":
      counter.process(body, postProcessing);
      break;
    default:
      postProcessing("Not implemented");
  }
}

function error(res, err) {
  res.statusCode = 400;
  res.end(err+"\n");
}

var server = http.createServer(function(req, res) {
  var url = parse(req.url);
  var path = join(root, url.pathname + ".json");
  res.setHeader('Content-Type', 'application/json; charset="utf-8"');
  switch (req.method) {
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
    case 'POST':
    var fullBody = '';
      req.on('data', function(chunk) {
        fullBody += chunk.toString();
      });
      req.on('end', function() {
        var decodedBody;
        try {
          decodedBody = JSON.parse(fullBody);
	}
	catch (err) {
	  error(res, err);
	  return;
	}
        put(url, decodedBody, function(err,msg) {
          if (err) {
	    error(res, err)
	    return;
          }
          res.end(msg + "\n");
        });
      });
      break;
    default:
      res.end("Unsupported Operation");
      break;
  }
});

frdb.connect(fs,function() {
  server.listen(process.env.SERVICE_PORT);
});
