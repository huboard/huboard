import Ember from 'ember';

var IssueEventMixin = Ember.Mixin.create({
  _events: {
    "{repositoryName} issues.{issueNumber}.issue_status_changed": "statusChanged",
    "{repositoryName} issues.{issueNumber}.issue_archived": "archived",
    "{repositoryName} issues.{issueNumber}.issue_closed": "closed",
    "{repositoryName} issues.{issueNumber}.assigned": "assigned",
    "{repositoryName} issues.{issueNumber}.moved": "moved",
    "{repositoryName} issues.{issueNumber}.reordered": "reordered",
    "{repositoryName} issues.{issueNumber}.milestone_changed": "milestoneChanged",
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

export default IssueEventMixin;
