var SearchController = Ember.Controller.extend({
  hideFilterBinding: "App.hideFilters",
  term: "",
  termChanged : Ember.debouncedObserver(function(){
    var term = this.get("term");
    App.set("searchFilter", {condition: function(i){
       return i.title.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) !== -1;
    }});

  },"term", 300)
});

module.exports = SearchController;
