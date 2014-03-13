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
        frdb.Overseeing.create({POLLING_AREA: count.pollingArea, MAGIC_WORD: count.password}, function (err, inserted) {
	  console.log("Inserted Rows: " + inserted.length);
	  console.log("Inserted: " + JSON.stringify(inserted[0]));
	  console.log("Created new overseeing: " + inserted[0].ID);
	  processCountWithOverseeing(count, array, inserted[0].ID, postProcessing);
	});
	return;
      case 1:
	console.log("Overseeing: " + overseeing[0].ID);
        processCountWithOverseeing(count, array, overseeing[0].ID, postProcessing);
	return;
      default: 
        postProcessing("Found multiple overseeing this area with this password failing");
        break;
    }
  });
}

function processCountWithOverseeing(count, array, overseeingId, postProcessing) {
  switch (array.length) {
    case 0:
      addNew(count, overseeingId, postProcessing);
      return;
    case 1:  
      update(array[0], count, overseeingId, postProcessing);
      return;
    default: 
      postProcessing("Multiple Counts with the same primary key have been identified");
      return;
  }
}

function addNew(count, overseeingId, postProcessing) {
  var newCount = {
    ID: count.GUID,
    PROVIDER: count.provider,
    POLLING_AREA: count.pollingArea,
    VOTES_CAST: count.votesCast,
    BALLOT_BOX: count.ballotBox,
    OVERSEEING: overseeingId
  }
  frdb.Count.create(newCount, function (err,inserted) {
    postProcessing(false, "Inserted new row: " + JSON.stringify(inserted));
  });
}

function update(count, postProcessing) {
  postProcessing(false, "Updating Count: " + count.GUID);
}

exports.process = function(count, postProcessing) {
  console.log(JSON.stringify(count));
  frdb.Count.find({ID: count.GUID}, function(err, array) {
    processCount(err, array, count, postProcessing);
  });
}
