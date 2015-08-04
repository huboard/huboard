import Ember from 'ember';

var CardEventMixin = Ember.Mixin.create({
  hbevents: {
    "{repositoryName} issues.{issue.number}.issue_status_changed": "statusChanged",
    "{repositoryName} issues.{issue.number}.issue_archived": "archived",
    "{repositoryName} issues.{issue.number}.issue_closed": "closed",
    "{repositoryName} issues.{issue.number}.issue_reopened": "opened",
    "{repositoryName} issues.{issue.number}.assigned": "assigned",
    "{repositoryName} issues.{issue.number}.moved": "moved",
    "{repositoryName} issues.{issue.number}.reordered": "reordered",
    "{repositoryName} issues.{issue.number}.milestone_changed": "milestoneChanged",
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
  },
  //K need to actually build out all this meta..
  _buildMeta: function(){
    var payload = {
      issue: this.get("issue")
    };
    return Ember.Object.create({
      channel: this.get("repositoryName"),
      identifier: this.get("issue.number"),
      type: "issues",
      payload: payload
    });
  }
});

export default CardEventMixin;
