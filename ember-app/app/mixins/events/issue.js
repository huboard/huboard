import Ember from 'ember';

var IssueEventMixin = Ember.Mixin.create({
  _events: {
    "{repositoryName} issues.{issueNumber}.issue_status_changed": "statusChanged",
  },
  _eventHandlers: {
    statusChanged: function(message){
      this.get("issue").set("_data", message.issue._data);
    }
  }
});

export default IssueEventMixin;
