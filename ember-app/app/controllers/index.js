import Ember from 'ember';

var IndexController = Ember.Controller.extend({
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
  forceRedraw: 0
});

export default IndexController;
