import Ember from 'ember';

var IssueEventMixin = Ember.Mixin.create({
  hbevents: {
    channel: "model.repo.full_name",
    "issues.{model.number}.issue_closed": "closed",
    "issues.{model.number}.issue_reopened": "opened"
  },
  _eventHandlers: {
    closed: function(message){
      //Not Yet Implemented
    },
    opened: function(message){
      //Not Yet Implemented
    },
  }
});

export default IssueEventMixin;
