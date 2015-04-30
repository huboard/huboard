import Ember from 'ember';

var AssigneeController = Ember.ObjectController.extend({
  needs: ["application"],
  noActiveMembers: function(){
    return this.get("avatars").length === 0;
  }.property("avatars"),
  actions: {
    clearFilters: function(){
      var self = this;
      Ember.run.once(function(){
        var params = ["assignee"];
        _.each(params, function(p){ self.get(p).clear(); });
        var allFilters = self.get("filters");
        _.each(allFilters, function(f){
          Ember.set(f,"mode",0);
        });
      });
    }
  },
  assigneesBinding: "controllers.application.model.board.assignees",
  assigneeBinding: "controllers.application.assignee",
  issuesBinding: "controllers.application.model.board.issues",
  memberFilterBinding: "App.memberFilter",
  lastClicked: null,
  filterChanged : function(){
    Ember.run.once(function(){
      this.get("lastClicked").get("content");
      this.set("memberFilter", {
        mode: this.get("lastClicked.mode"),
        condition: this.get("lastClicked.content.condition")
      });
    }.bind(this));
  }.observes("lastClicked.mode"),
  avatars : function () {
    var issues = this.get("issues")
    return this.get("assignees").filter(function(assignee){
      return _.find(issues, function(issue){
        return issue.assignee &&
          issue.assignee.login === assignee.login;
      });
    });
  }.property("assignees", "issues.@each.assignee"),
  filters : function () {
     return this.get("avatars").map(function(a){
         return Ember.Object.create({
           avatar : a,
           mode: 0,
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
});

export default AssigneeController;
