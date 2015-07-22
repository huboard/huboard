import Ember from 'ember';

var IndexController = Ember.Controller.extend({
  needs: ["application"],
  registeredColumns: Ember.A(),

  qps: Ember.inject.service("query-params"),
  queryParams: [
    {"qps.searchParams": "search"},
    {"qps.repoParams": "repo"},
    {"qps.assigneeParams": "assignee"},
    {"qps.milestoneParams": "milestone"},
    {"qps.labelParams": "label"}
  ],
  applyUrlFilters: function(){
    var self = this;
    Ember.run.once(function(){
      self.get("qps").applyFilterParams();
      self.get("qps").applySearchParams();
    });
  }.observes("qps.filterParams", "qps.searchParams").on("init"),

  filters: Ember.inject.service(),
  filtersActive: Ember.computed.alias("filters.filterGroups.active"),

  isSidebarOpen: Ember.computed.alias("controllers.application.isSidebarOpen"),
  board_columns: function(){
     return this.get("model.columns");
  }.property("model.columns"),
  isCollaborator: function(){
    return App.get("repo.is_collaborator");
  }.property('App.repo.is_collaborator'),

  actions: {
    registerColumn: function(column_component){
      this.get("registeredColumns").pushObject(column_component);
    },
    unregisterColumn: function(column_component){
      this.get("registeredColumns").removeObject(column_component);
    },
    createNewIssue: function(issue){
      this.get("target").send("createNewIssue", issue);
    },
    createFullscreenIssue: function(issue, order){
      this.get("target").send("createFullscreenIssue", issue, order);
    },
    openFullscreenIssue(issue){
      this.get("target").send("openFullscreenIssue", issue);
    }
  }
});

export default IndexController;
