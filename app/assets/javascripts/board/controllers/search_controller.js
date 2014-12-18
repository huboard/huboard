var Fuse = require("../vendor/fuse.min");
var SearchController = Ember.Controller.extend({
  needs:["application"],

  search: function(){
    App.set("_queryParams.search", this.get("term"));
  }.observes("term"),
  searchChanged: function(){
    this.set("term", App.get("_queryParams.search"));
  }.observes("App._queryParams.search").on("init"),
  term: "",
  termChanged : Ember.debouncedObserver(function(){
    var term = this.get("term");
    var issues = this.get("controllers.application.model.board.combinedIssues");
    var threshold = isNaN(term) ? 0.4 : 0.1;
    var Searcher = new Fuse(issues, {keys: ["title","number_searchable"], id: "id", threshold: threshold});
    var results = Searcher.search(term);
    App.set("searchFilter", {condition: function(i){
       return term.length == 0 || results.indexOf(i.id) !== -1;
    }});

  },"term", 300),
  filtersActive: function(){
    return this.get("term").length
  }.property("term"),
  actions : {
    clearFilters : function(){
      this.set("term", "");
    }
  }
});

module.exports = SearchController;
