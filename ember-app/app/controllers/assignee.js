import Ember from 'ember';

var AssigneeController = Ember.Controller.extend({
  needs: ["application"],
  noActiveMembers: function(){
    return this.get("avatars").length === 0;
  }.property("avatars"),
  actions: {
    clearFilters: function(){
      var self = this;
      Ember.run.once(function(){
        var params = ["member"];
        _.each(params, function(p){ self.get(p).clear(); });
        var allFilters = self.get("filters");
        _.each(allFilters, function(f){
          Ember.set(f,"mode",0);
        });
      });
    }
  },
  assigneesBinding: "controllers.application.model.board.assignees",
  combinedBinding: "controllers.application.model.board.combinedAssignees",
  combinedIssuesBinding: "controllers.application.model.board.combinedIssues",
  memberBinding: "controllers.application.member",
  issuesBinding: "controllers.application.model.board.issues",
  memberFilterBinding: "App.memberFilter",
  lastClicked: null,
  filterChanged : function(){
    Ember.run.once(function(){
      this.get("lastClicked").get("content");
      this.set("memberFilter", {
        mode: this.get("lastClicked.mode"),
        strategy: "inclusive",
        condition: this.get("lastClicked.content.condition")
      });
    }.bind(this));
  }.observes("lastClicked.mode"),
  avatars : function () {
    var issues = this.get("combinedIssues");
    return this.get("combined").filter(function(assignee){
      return _.find(issues, function(issue){
        return issue.assignee &&
          issue.assignee.login === assignee.login;
      });
    });
  }.property("assignees", "issues.@each.assignee", "combined", "combinedIssues.@each.assignee"),
  filters : function () {
     return this.get("avatars").map(function(a){
         return Ember.Object.create({
           avatar : a,
           mode: 0,
           strategy: "inclusive",
           condition: function (i) {
              return i.assignee && i.assignee.login === a.login;
           }
         });
     });
  }.property("avatars"),
  filtersActive: function(){
   return this.get("filters").any(function(f){
      return Ember.get(f, "mode") !== 0;
    });
  }.property("filters.@each.mode"),
  resetMembersFilter: function(){
    var self = this;
    Ember.run.once(function(){
      if(!self.get("filtersActive")){
        App.set("memberFilter", null);
      }
    });
  }.observes("filtersActive")
});

export default AssigneeController;
