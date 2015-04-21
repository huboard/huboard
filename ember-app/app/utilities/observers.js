import Ember from 'ember';

var debouncedObserver = function(func, key, time){
  return Ember.observer(function(){
    Ember.run.debounce(this, func, time);
  }, key);
};
var throttledObserver = function(func, key, time){
  return Ember.observer(function(){
    Ember.run.throttle(this, func, time);
  }, key);
};

export {
  debouncedObserver,
  throttledObserver
};
