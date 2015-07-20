import Ember from 'ember';
import Issue from 'app/models/issue';

var ApplicationController = Ember.Controller.extend({
  qps: Ember.inject.service("query-params"),
  isSidebarOpen: false,
  filters: Ember.inject.service(),
  setFilters: function(){
    if(this.get("model.board")){
      this.get("filters.filterGroups").setGroups(this.get("model.board"));
    }
  }.observes("model.board"),

  sockets: {
    config: {
      messagePath: "issueNumber",
      channelPath: "repositoryName"
    },
    issue_closed: function(message) {
      var issue = this.get("model.board.issues").findBy('number', message.issue.number);

      if(issue) {
        issue.set("state", "closed");
      } else {
        this.get("model.board.issues").pushObject(Issue.create(message.issue));
      }
    },
    issue_opened: function(message) {
      var issue = this.get("model.board.issues").findBy('number', message.issue.number);

      if(issue) {
        issue.set("state", "open");
      } else {
        var model = Issue.create(message.issue);
        if(message.issue.current_state.name === "__nil__") {
          model.set("current_state", this.get("model.board.columns.firstObject"));
        }else {
          var column = this.get("model.board.columns").find(function(c) {
            return c.name === message.issue.current_state.name;
          });
          model.set("current_state", column);
        }
        this.get("model.board.issues").pushObject(model);
      }
    },
    issue_reopened: function(message) {
      var issue = this.get("model.board.issues").findBy('number', message.issue.number);

      if(issue) {
        issue.set("state", "open");
      } else {
        this.get("model.board.issues").pushObject(Issue.create(message.issue));
      }
    }
  },
  issueNumber: function () {
     return "*";
  }.property(),
  repositoryName: function () {
    return this.get("model.full_name");
  }.property("model.full_name"),
  currentUser: function(){
    return App.get("currentUser");
  }.property("App.currentUser"),
  loggedIn: function(){
    return App.get("loggedIn");
  }.property("App.loggedIn")
});

export default ApplicationController;
