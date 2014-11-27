var IndexController = Ember.ObjectController.extend({
  needs: ["application"],
  queryParams: ["assigneeqp", "repoqp", "milestoneqp", "labelqp"],
  repoqp: [],
  assigneeqp: [],
  milestoneqp: [],
  labelqp: [],
  isSidebarOpen: Ember.computed.alias("controllers.application.isSidebarOpen"),
  board_columns: function(){
     return this.get("columns");
  }.property("columns"),
  forceRedraw: 0
});

module.exports = IndexController;
