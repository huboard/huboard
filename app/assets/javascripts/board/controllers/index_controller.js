var IndexController = Ember.ObjectController.extend({
  needs: ["application", "filters", "assignee", "search"],
  isSidebarOpen: Ember.computed.alias("controllers.application.isSidebarOpen"),
  filtersActive: function(){
    return  this.get("controllers.filters.filtersActive") ||
            this.get("controllers.search.filtersActive") ||
            this.get("controllers.assignee.filtersActive");

  }.property("controllers.filters.filtersActive", "controllers.assignee.filtersActive", "controllers.search.filtersActive"),
  board_columns: function(){
     return this.get("columns");
  }.property("columns"),
  forceRedraw: 0,

  queryParams: ["repo", "label", "assignee", "milestone", "search", "assignment"],
  search: "",
  repo: [],
  milestone: [],
  label: [],
  assignment: [],
  assignee: [],
  syncQueryParams: function(){
    App.get("_queryParams").syncQueryParams(this);
  }.observes("repo", "milestone", "label", "assignment", "assignee"),
  //syncSearchParams: function(){
  //  if (!this.get("search").length){
  //    this.set("search", this.get("controllers.search.term"));
  //  } else {
  //    this.set("controllers.search.term", this.get("search"));
  //  }
  //}.observes("controllers.search.term", "search").on("init")
});

module.exports = IndexController;
