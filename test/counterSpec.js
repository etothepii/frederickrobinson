var expect = require("chai").expect
var counter = require("../lib/counter.js");

function mockTable(array,table) {
  this.created=0;
  this.get = get;
  function get(id, postProcessing) {
    if (id < array.length && array[id] != null) {
      array[id].saved=0;
      array[id].save = function(error) { 
        this.saved++;
      }
      postProcessing(false, array[id]);
    }
    else {
      postProcessing("Not found in " + table, null);
    }
  }
  function create(obj, result) {
    this.created++;
  }
}

function mockDb() {
  var overseeingReturn = 0;
  this.Count = new mockTable(mockCounts,"Count");
  var overseeing = new mockTable(mockOverseeings,"Overseeing");
  this.Overseeing = overseeing;
  this.Overseeing.find = find;
  function find(criteria, postProcessing) {
    overseeing.get(criteria.POLLING_AREA, postProcessing);
  }
  this.PollingArea = new mockTable(mockPollingAreas,"PollingArea");
}

var mockCounts = [
  {
    "GUID": 0,
    "provider": "gajusz@gmail.com",
    "pollingArea": 0,
    "password": "banana",
    "votesCast": 2314,
    "ballotBox": "Box 112",
    "tallies": []
  },
  {
    "GUID": 1,
    "provider": "gajusz@gmail.com",
    "pollingArea": 1,
    "password": "banana",
    "votesCast": 2314,
    "ballotBox": "Box 112",
    "tallies": []
  },
  {
    "GUID": 2,
    "provider": "gajusz@gmail.com",
    "pollingArea": 2,
    "password": "banana",
    "votesCast": 2314,
    "ballotBox": "Box 112",
    "tallies": []
  },
  {
    "GUID": 3,
    "provider": "gajusz@gmail.com",
    "pollingArea": 4,
    "password": "banana",
    "votesCast": 2314,
    "ballotBox": "Box 112",
    "tallies": []
  }
];
var mockOverseeings = [
  [{
    "POLLING_AREA": 0
  }],
  [{
    "POLLING_AREA": 1
  },
  {
    "POLLING_AREA": 1
  }],
  [],
  [{
    "POLLING_AREA": 3
  }],
  []
];
var mockPollingAreas = [
  {
    "ID": 0,
    "PARENT": null
  },
  {
    "ID": 1,
    "PARENT": 0
  },
  {
    "ID": 2,
    "PARENT": null
  },
  {
    "ID": 3,
    "PARENT": null
  },
  {
    "ID": 4,
    "PARENT": 3
  }
];

var mockDb = new mockDb();

counter.setDB(mockDb);

describe("Counter", function() {
  describe("#Process()", function() {
    it("Should process Count with single overseeing", function() {
      mockCounts[0].saved = 0;
      mockDb.Count.created = 0;
      counter.process(mockCounts[0], function(err, old) {
        expect(err).to.equal(false);
        expect(mockCounts[0].saved).to.equal(0);
        expect(mockDb.Count.created).to.equal(0);
      });
    });
    it("Should not process Count with two overseeing", function() {
      mockCounts[1].saved = 0;
      mockDb.Count.created = 0;
      counter.process(mockCounts[1], function(err, old) {
        expect(err).to.equal('Found multiple overseeing this area with this password failing');
        expect(mockCounts[1].saved).to.equal(0);
        expect(mockDb.Count.created).to.equal(0);
      });
    });
    it("Should not process Count with no one overseeing", function() {
      mockCounts[2].saved = 0;
      mockDb.Count.created = 0;
      counter.process(mockCounts[2], function(err, old) {
        expect(err).to.equal('No agent overseeing this count found with password provided');
        expect(mockCounts[2].saved).to.equal(0);
        expect(mockDb.Count.created).to.equal(0);
      });
    });
    it("Should be able to update where only parent is overseen", function() {
      mockCounts[3].saved = 0;
      mockDb.Count.created = 0;
      counter.process(mockCounts[3], function(err, old) {
        expect(err).to.equal(false);
        expect(mockCounts[3].saved).to.equal(1);
        expect(mockDb.Counter.created).to.equal(0);
      });
    });
  });
});
