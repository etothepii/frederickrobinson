var orm = require("orm");

exports.connect = function (fs, after) {
  var password;
  fs.readFile('./resources/password', 'utf8', function read(err, data) {
  
    if (err) {
      throw err;
    }
    password = data;
    connectToDatabase(password, orm);
    after();
  });
}

function connectToDatabase(password, orm) {
  orm.connect("mysql://fredrobinson:" + password + "@localhost/frederickRobinson", function (err, db) {
    if (err) throw err;
    buildORM(db);
  });
}

var agent;
var user;
var pollingArea;
var overseeing;
var candidate;
var tally;
var count;
var politicalParty;

function buildORM(db) {
  agent = db.define("Agent", {
    ID: Number,
    EMAIL: String,
    PASSWORD: String
  },{
    id: "ID"
  });
  exports.Agent = agent;
  user = db.define("User", {
    ID: Number,
    EMAIL: String,
    PHONE_IDENTIFIER: String
  },
  {
    id: "ID"
  });
  exports.User = user;
  pollingArea = db.define("PollingArea", {
    ID: Number,
    NAME: String,
    CHILD_TYPE: String,
    PARENT: Number
  },
  {
    id: "ID"
  });
  exports.PollingArea = pollingArea;
  pollingArea.hasOne("parent", pollingArea, {field:"PARENT", reverse:"children"});
  overseeing = db.define("Overseeing", {
    ID: Number,
    AGENT: Number,
    POLLING_AREA: Number,
    MAGIC_WORD: String
  },
  {
    id: "ID"
  });
  exports.Overseeing = overseeing;
  overseeing.hasOne("pollingArea", pollingArea, {field:"POLLING_AREA"});
  overseeing.hasOne("agent", agent, {field:"AGENT", reverse:"watching"});
  count = db.define("Count", {
    ID: String,
    OVERSEEING: Number,
    PROVIDER: Number,
    POLLING_AREA: Number,
    VOTES_CAST: Number,
    BALLOT_BOX: String
  },
  {
    id: "ID"
  });
  exports.Count = count;
  count.hasOne("overseeing", overseeing, {field:"OVERSEEING", reverse:"counts"});
  count.hasOne("provider", user, {field:"PROVIDER", reverse:"counts"});
  count.hasOne("pollingArea", pollingArea, {field:"POLLING_AREA", reverse:"counts"});
  politicalParty = db.define("PoliticalParty", {
    ID: Number,
    NAME: String,
    MAJOR: Boolean,
    COLOUR: String,
    LOGO_REF: String
  },
  {
    id: "ID"
  });
  exports.PoliticalParty = politicalParty;
  candidate = db.define("Candidate", {
    ID: Number,
    SURNAME: String,
    OTHER_NAMES: String,
    PARTY: Number,
    ELECTION_AREA: Number,
    DISPLAYABLE: Boolean,
    ORDER: Number
  },
  {
    id: "ID"
  });
  candidate.hasOne("party", politicalParty, {field:"PARTY", reverse:"candidates"});
  candidate.hasOne("electionArea", pollingArea, {field:"ELECTION_AREA", reverse:"candidates"});
  exports.Candidate = candidate;
  tally = db.define("Tally", {
    ID: Number,
    CANDIDATE: Number,
    PARTY: Number,
    COUNT: String,
    VOTES: Number
  },
  {
    id: "ID"
  });
  exports.Tally = tally;
  tally.hasOne("candidate", candidate, {field:"POLLING_AREA", reverse:"tallies"});
  tally.hasOne("party", politicalParty, {field:"PARTY"});
  tally.hasOne("count", count, {field:"COUNT", reverse:"tallies"});
}
