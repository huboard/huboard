var SearchController = Ember.Controller.extend({
  hideFilterBinding: "App.hideFilters",
  term: "",
  termChanged : Ember.debouncedObserver(function(){

  },"term", 300)
});

module.exports = SearchController;
