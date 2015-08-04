import Ember from 'ember';

var IssueEventMixin = Ember.Mixin.create({
  hbevents: {
    "{repositoryName} local.{model.number}.issue_closed": "closed",
    "{repositoryName} local.{model.number}.issue_reopened": "opened"
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
  },
  _buildMeta: function(){
    var payload = {
      issue: this.get("model")
    };
    return Ember.Object.create({
      channel: this.get("repositoryName"),
      identifier: this.get("model.number"),
      type: "local",
      payload: payload
    });
  }
});

export default IssueEventMixin;
