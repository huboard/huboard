import Ember from 'ember';

var CardEventMixin = Ember.Mixin.create({
  hbevents: {
    channel: "repositoryName",
    "issues.{issue.number}.issue_status_changed": "statusChanged",
    "issues.{issue.number}.issue_archived": "archived",
    "issues.{issue.number}.issue_closed": "closed",
    "issues.{issue.number}.issue_reopened": "opened",
    "issues.{issue.number}.assigned": "assigned",
    "issues.{issue.number}.moved": "moved",
    "issues.{issue.number}.reordered": "reordered",
    "issues.{issue.number}.milestone_changed": "milestoneChanged",
  },
  _eventHandlers: {
    statusChanged: function(message){
      this.get("issue").set("_data", message.issue._data);
    },
    archived: function(){
      this.get('issue').set('isArchived', true);
    },
    closed: function(message){
     this.get("issue").set("state", message.issue.state);
    },
    opened: function(message){
     this.get("issue").set("state", message.issue.state);
    },
    assigned: function(message){
     this.get("issue").set("assignee", message.issue.assignee);
    },
    moved: function (message) {
      this.get('issue').setProperties({
        current_state : message.issue.current_state,
        _data: message.issue._data
      });
    },
    reordered: function (message) {
       this.get("issue").set("current_state", message.issue.current_state);
       this.get("issue").set("_data", message.issue._data);
    },
    milestoneChanged: function(message) {
       this.get("issue").set("milestone", message.issue.milestone);
    },
  }
});

export default CardEventMixin;
