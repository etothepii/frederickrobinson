var expect = require("chai").expect
var counter = require("../lib/counter.js");

function mockTable(array,table) {
  this.get = get;
  function get(id, postProcessing) {
    if (id < array.length && array[id] != null) {
      array[id].save = function(error) { }
      postProcessing(false, array[id]);
    }
    else {
      postProcessing("Not found in " + table, null);
    }
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
  }
];

var mockDb = new mockDb();

counter.setDB(mockDb);

describe("Counter", function() {
  describe("#Process()", function() {
    it("Should process Count with single overseeing", function() {
      counter.process(mockCounts[0], function(err, old) {
        expect(err).to.equal(false);
      });
    });
    it("Should not process Count with two overseeing", function() {
      counter.process(mockCounts[1], function(err, old) {
        expect(err).to.equal('Found multiple overseeing this area with this password failing');
      });
    });
    it("Should not process Count with no one overseeing", function() {
      counter.process(mockCounts[2], function(err, old) {
        expect(err).to.equal('No agent overseeing this count found with password provided');
      });
    });
  });
});
