var frdb;

exports.setDB = function(db) {
  frdb = db;
}

function processCount(err, array, count, postProcessing) {
  if (err) {
    postProcessing(err);
    return;
  }
  switch (array.length) {
    case 0:
      addNew(count, postProcessing);
      return;
    case 1:  
      update(array[0], count, postProcessing);
      return;
    default: 
      postProcessing("Multiple Counts with the same primary key have been identified");
      return;
  }
}

function addNew(count, postProcessing) {
  postProcessing(false, "Adding New Count: " + count.ID);
}

function update(count, postProcessing) {
  postProcessing(false, "Updating Count: " + count.ID);
}

exports.process = function(count, postProcessing) {
  frdb.Count.find({ID: count.ID}, function(err, array) {
    processCount(err, array, count, postProcessing);
  });
}
