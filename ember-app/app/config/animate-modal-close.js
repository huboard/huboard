import Ember from 'ember';

var animateModalClose = function() {
  var promise = new Ember.RSVP.defer();

  Ember.$('body').removeClass("fullscreen-open");
  promise.resolve();


  return promise.promise;
};

export default animateModalClose;
