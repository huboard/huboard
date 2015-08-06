import Ember from 'ember';

var IssueEventMixin = Ember.Mixin.create({
  hbevents: {
    channel: "{model.repo.full_name}",
    "issues.{model.number}.issue_closed": "closed",
    "issues.{model.number}.issue_reopened": "opened"
  },
  _eventHandlers: {
    closed: function(){
      //Not Yet Implemented
    },
    opened: function(){
      //Not Yet Implemented
    },
  }
});

export default IssueEventMixin;
