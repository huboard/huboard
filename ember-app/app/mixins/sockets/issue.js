import SocketMixin from 'app/mixins/socket';
import Ember from 'ember';

var IssueSocketMixin = Ember.Mixin.create({
  sockets: {
    config: {
      messagePath: "issueNumber",
      channelPath: "repositoryName"
    },
    milestone_changed: function(message) {
       this.get("model").set("milestone", message.issue.milestone);
       Ember.run.once(function () {
         this.send("forceRepaint", "milestones");
       }.bind(this));
    },
    issue_status_changed: function(message){
       this.get("model").set("_data", message.issue._data);
    },
    issue_archived: function(){
      this.get('model').set('isArchived', true);
    },
    issue_closed: function(message) {
       this.get("model").set("state", message.issue.state);
    },
    assigned: function(message) {
       this.get("model").set("assignee", message.issue.assignee);
    },
    moved: function (message) {
       this.get("model").set("current_state", message.issue.current_state);
       this.get("model").set("_data", message.issue._data);
       Ember.run.once(function () {
         this.send("forceRepaint", "index");
       }.bind(this));
    },
    reordered: function (message) {
       this.get("model").set("current_state", message.issue.current_state);
       this.get("model").set("_data", message.issue._data);
       Ember.run.once(function () {
         this.send("forceRepaint", "index");
       }.bind(this));
    }
  }
});

export default IssueSocketMixin;
