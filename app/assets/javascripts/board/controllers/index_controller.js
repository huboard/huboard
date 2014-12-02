var IndexController = Ember.ObjectController.extend({
  needs: ["application", "filters"],
  isSidebarOpen: Ember.computed.alias("controllers.application.isSidebarOpen"),
  filtersActive: Ember.computed.alias("controllers.filters.filtersActive"),
  board_columns: function(){
     return this.get("columns");
  }.property("columns"),
  forceRedraw: 0
});

module.exports = IndexController;
