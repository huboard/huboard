import Ember from 'ember';

var IssueSubscriptionMixin = Ember.Mixin.create({
  hbsubscriptions: {
    channel: "{model.repo.full_name}",
    "issues.{model.number}.issue_closed": "closed",
    "issues.{model.number}.issue_reopened": "opened"
  },
  hbsubscribers: {
    closed: function(){
      //Not Yet Implemented
    },
    opened: function(){
      //Not Yet Implemented
    },
  }
});

export default IssueSubscriptionMixin;
