var http = require('http')
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var orm = require("orm");
var root = 'data/'

var password;
fs.readFile('./resources/password', 'utf8', function read(err, data) {
  
  if (err) {
    throw err;
  }
  password = data;
  connectToDatabase(password, orm);
});

function connectToDatabase(password, orm) {
  orm.connect("mysql://fredrobinson:" + password + "@localhost/frederickRobinson", function (err, db) {
    if (err) throw err;
    buildORM(db);
  });
}

var politicalParty;

function buildORM(db) {
  politicalParty = db.define("PoliticalParty", {
    ID: Number,
    NAME: String,
    COLOUR: String,
    LOGO_REF: String
  });
}

function get(url, writer) {
  politicalParty.find({ID:1}, function (err, politicalParties) {
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

server.listen(3000);
