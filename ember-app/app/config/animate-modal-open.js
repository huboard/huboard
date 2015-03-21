import Ember from 'ember';

var animateModalOpen = function() {
  var promise = new Ember.RSVP.defer();

   $('body').addClass("fullscreen-open");
  promise.resolve();
  

  return promise.promise;
};

export default animateModalOpen;
