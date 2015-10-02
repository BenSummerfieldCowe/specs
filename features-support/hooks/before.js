'use strict';

module.exports = function beforeHooks() {

  // Remove any old test data.
  this.Before('@cleanSlate', function(callback) {
    var world = this;
    world.deleteProjectData()
      .then(function() {
        callback();
      })
      .catch(function(err) {
        callback(err);
      });
  });
};
