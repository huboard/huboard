import Ember from 'ember';

var IssueEventMixin = Ember.Mixin.create({
  channel: Ember.computed.alias("model.repo.full_name"),
  hbevents: {
    "local.{model.number}.issue_closed": "closed",
    "local.{model.number}.issue_reopened": "opened"
  },
  _eventHandlers: {
    closed: function(){
     console.log("MESSAGE RECEIVED YO");
     //this.get("model").set("state", message.issue.state);
    },
    opened: function(){
     console.log("MESSAGE RECEIVED YO");
     //this.get("model").set("state", message.issue.state);
    },
  }
});

export default IssueEventMixin;
