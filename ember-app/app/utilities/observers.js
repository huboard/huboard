Ember.debouncedObserver = function(func, key, time){
  return Ember.observer(function(){
    Ember.run.debounce(this, func, time)
  }, key)
};
Ember.throttledObserver = function(func, key, time){
  return Ember.observer(function(){
    Ember.run.throttle(this, func, time)
  }, key)
};

export default undefined;
