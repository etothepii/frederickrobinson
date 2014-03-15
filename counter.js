var frdb;

exports.setDB = function(db) {
  frdb = db;
}

function processCount(old, count, postProcessing) {
  processCountWithPollingArea(old, count, count.pollingArea, postProcessing);
}

function processCountWithPollingArea(old, count, pollingArea, postProcessing) {
  frdb.Overseeing.find({MAGIC_WORD: count.password, POLLING_AREA: count.pollingArea}, function(err, overseeing) {
    switch (overseeing.length) {
      case 0:
        if (pollingArea.hasOwner()) {
	  processCountWithPollingArea(old, count, pollingArea.getParent(), postProcessing);
	  return;
	}
        postProcessing("No agent overseeing this count found with password provided");
	return;
      case 1:
        processCountWithOverseeing(count, old, overseeing[0].AGENT, postProcessing);
	return;
      default: 
        postProcessing("Found multiple overseeing this area with this password failing");
        break;
    }
  });
}

function processCountWithOverseeing(count, old, agentId, postProcessing) {
  if (old == null) {
    addNew(count, agentId, postProcessing);
    return;
  }
  update(old, count, agentId, postProcessing);
}

function addNew(count, agentId, postProcessing) {
  var newCount = {
    ID: count.GUID,
    PROVIDER: count.provider,
    POLLING_AREA: count.pollingArea,
    VOTES_CAST: count.votesCast,
    BALLOT_BOX: count.ballotBox,
    AGENT: agentId
  };
  frdb.Count.create(newCount, function (err,inserted) {
    if (err) {
      postProcessing(err);
      return;
    }
    saveTally(count, 0, postProcessing);
  });
}

function saveTally(count, i, postProcessing) {
  if (i == count.tallies.length) {
    postProcessing(false, "Successfully Created / Updated Count");
    return;
  }
  var tally = count.tallies[i];
  frdb.Tally.create({
    CANDIDATE: tally.candidate,
    PARTY: tally.party,
    COUNT: count.GUID,
    VOTES: tally.votes
  }, function (err, items) {
    if (err) {
      postProcessing(err);
    }
    else {
      saveTally(count, i + 1, postProcessing);
    }  
  });
}

function update(old, count, agentId, postProcessing) {
  old.PROVIDER =  count.provider;
  old.POLLING_AREA = count.pollingArea;
  old.VOTES_CAST = count.votesCast;
  old.BALLOT_BOX = count.ballotBox;
  old.AGENT = count.agentId;
  old.save(function (err) {
    if (err) {
      postProcessing(err);
      return;
    }
    frdb.Tally.find({Count: count.GUID}).remove(function(err) {
      if (err) {
        postProcessing(err);
	  return;
      }
      else {
        saveTally(count, 0, postProcessing);
      }
    });
  });
}

exports.process = function(count, postProcessing) {
  frdb.Count.get(count.GUID, function(err, old) {
    processCount((err) ? null : old, count, postProcessing);
  });
}
