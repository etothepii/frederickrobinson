var expect = require("chai").expect
var counter = require("../lib/counter.js");

function mockTable(array) {
  this.get = get;
  function get(id, postProcessing) {
    if (id < array.length) {
      postProcessing(false, array[id]);
    }
    else {
      postProcessing("Not found", null);
    }
  }
}

function mockDb() {
  var overseeingReturn = 0;
  this.Count = new mockTable(mockCounts);
  var overseeing = new mockTable(mockOverseeings);
  this.Overseeing = overseeing;
  this.Overseeing.find = find;
  function find(criteria, postProcessing) {
    overseeing.get(criteria.POLLING_AREA, postProcessing);
  }
  this.PollingArea = new mockTable(mockPollingAreas);
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
  }
];
var mockOverseeings = [];
var mockPollingAreas = [
  {
    "ID": 0,
    "PARENT": null
  },
  {
    "ID": 1,
    "PARENT": 0
  }
];

var mockDb = new mockDb();

counter.setDB(mockDb);

describe("Counter", function() {
  describe("#Process()", function() {
    it("Should process Count", function() {
      counter.process(mockCounts[0], function(err, old) {
        
      });
    });
  });
});
