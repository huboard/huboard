import Ember from 'ember';

var debouncedObserver = function(func, key, time){
  return Ember.observer(key, function(){
    Ember.run.debounce(this, func, time);
  });
};
var throttledObserver = function(func, key, time){
  return Ember.observer(key, function(){
    Ember.run.throttle(this, func, time);
  });
};

export {
  debouncedObserver,
  throttledObserver
};
