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
  }.observes("repo", "milestone", "label", "assignment", "assignee", "search"),
  syncSearch: function(){
    this.set("search", App.get("_queryParams.search"));
  }.observes("App._queryParams.search")
});

module.exports = IndexController;
