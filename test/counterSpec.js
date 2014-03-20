var expect = require("chai").expect
var counter = require("../lib/counter.js");

function mockTable() {
  this.get = get;
  function get(id, postProcessing) {
    return {};
  }
}

function mockDb() {
  this.Count = new mockTable();
}

counter.setDB(new mockDb());

var count = {
  "GUID": "01234-5678-90AB-CDEF",
  "provider": "gajusz@gmail.com",
  "pollingArea": 21,
  "password": "banana",
  "votesCast": 2314,
  "ballotBox": "Box 112",
  "tallies": [
    {
      "party": 148,
      "candidate": 1,
      "votes": 372
    },
    {
      "party": 103,
      "candidate": 2,
      "votes": 59
    },
    {
      "party": 153,
      "candidate": 3,
      "votes": 38
    },
    {
      "party": 65,
      "candidate": 4,
      "votes": 116
    },
    {
      "party": null,
      "candidate": 5,
      "votes":613
    }
  ]
}

describe("Counter", function() {
  describe("#Process()", function() {
    it("Should process Count", function() {
      counter.process(count, function(err, old) {
        
      });
    });
  });
});
