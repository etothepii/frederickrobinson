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

function buildORM(db) {
  exports.Agent = db.define("Agent", {
    ID: Number,
    EMAIL: String,
    PASSWORD: String
  },{
    id: "ID"
  });
  exports.User = db.define("User", {
    ID: Number,
    EMAIL: String,
    PHONE_IDENTIFIER: String
  },
  {
    id: "ID"
  });
  exports.Overseeing = db.define("Overseeing", {
    ID: Number,
    AGENT: Number,
    POLLING_AREA: Number,
    MAGIC_WORD: String
  },
  {
    id: "ID"
  });
  exports.Count = db.define("Count", {
    GUID: String,
    OVERSEEING: Number,
    PROVIDER: Number,
    POLLING_AREA: Number,
    VOTES_CAST: Number,
    BALLOT_BOX: String
  },
  {
    id: "GUID"
  });
  exports.PoliticalParty = db.define("PoliticalParty", {
    ID: Number,
    NAME: String,
    MAJOR: Boolean,
    COLOUR: String,
    LOGO_REF: String
  },
  {
    id: "ID"
  });
  exports.Tally = db.define("Tally", {
    ID: Number,
    CANDIDATE: Number,
    PARTY: Number,
    COUNT: String
  },
  {
    id: "ID"
  });
  exports.PollingArea = db.define("PollingArea", {
    ID: Number,
    NAME: String,
    CHILD_TYPE: String,
    PARENT: Number
  },
  {
    id: "ID"
  });
  exports.Candidate = db.define("Candidate", {
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
}
