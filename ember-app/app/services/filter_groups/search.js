import Ember from "ember";
import { debouncedObserver } from 'app/utilities/observers';

var SearchFilter = Ember.Service.extend({
  strategy: "inclusive",
  term: "",
  combinedIssuesBinding: "board.combinedIssues",

  create: function(model){
    this.set("board", model);
    Ember.run.sync();

    this.createFilter();
    return this.get("filters");
  },

  createFilter: function(){
    var term = this.get("term");
    var issues = this.get("combinedIssues");
    var threshold = isNaN(term) ? 0.4 : 0.1;
    var Searcher = new Fuse(issues, {keys: ["title","number_searchable"], id: "id", threshold: threshold});
    var results = Searcher.search(term);
    this.set("filters", [{
      search: true,
      mode: term.length ? 2 : 0,
      condition: function(i){
       return term.length === 0 || results.indexOf(i.id) !== -1;
      },
    }]);
  },

  termChanged : debouncedObserver(function(){
    this.createFilter();
  },"term","combinedIssues", 300)
});

export default SearchFilter;
