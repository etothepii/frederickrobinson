var frdb;

exports.setDB = function(db) {
  frdb = db;
}

function processCount(err, array, count, postProcessing) {
  if (err) {
    postProcessing(err);
    return;
  }
  frdb.Overseeing.find({MAGIC_WORD: count.password, POLLING_AREA: count.pollingArea}, function(err, overseeing) {
    switch (overseeing.length) {
      case 0:
        postProcessing("No agent overseeing this count found with password provided");
	return;
      case 1:
        processCountWithOverseeing(count, array, overseeing[0].AGENT, postProcessing);
	return;
      default: 
        postProcessing("Found multiple overseeing this area with this password failing");
        break;
    }
  });
}

function processCountWithOverseeing(count, array, agentId, postProcessing) {
  switch (array.length) {
    case 0:
      addNew(count, agentId, postProcessing);
      return;
    case 1:  
      update(array[0], count, agentId, postProcessing);
      return;
    default: 
      postProcessing("Multiple Counts with the same primary key have been identified");
      return;
  }
}

function addNew(count, agentId, postProcessing) {
  var newCount = {
    ID: count.GUID,
    PROVIDER: count.provider,
    POLLING_AREA: count.pollingArea,
    VOTES_CAST: count.votesCast,
    BALLOT_BOX: count.ballotBox,
    AGENT: agentId
  }
  frdb.Count.create(newCount, function (err,inserted) {
    for (var i = 0; i < count.tallies.length; i++) {
      var tally = count.tallies[i]
      frdb.Tally.create({
        CANDIDATE: tally.candidate,
	PARTY: tally.party,
	COUNT: count.GUID,
	VOTES: tally.votes
      }, function (err, items) {});
    }
    postProcessing(false, "Inserted new row: " + JSON.stringify(inserted));
  });
}

function update(old, count, agentId, postProcessing) {
  postProcessing(false, "Updating Count: " + count.GUID);
}

exports.process = function(count, postProcessing) {
  frdb.Count.find({ID: count.GUID}, function(err, array) {
    processCount(err, array, count, postProcessing);
  });
}
