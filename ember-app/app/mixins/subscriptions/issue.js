import Ember from 'ember';

var IssueSubscriptionMixin = Ember.Mixin.create({
  hbsubscriptions: {
    channel: "{model.repo.full_name}",
    "issues.{model.number}.issue_closed": "closed",
    "issues.{model.number}.issue_reopened": "opened"
  },
  hbsubscribers: {
    closed: function(message){
      var activities = this.get("sortedActivities");
      var unique = this._eventHandlers._activityUnique;
      if(!activities.length || unique(activities, message)){
        var activity = this._eventHandlers._activity(message, "closed");
        activities.pushObject(activity);
      }
    },
    opened: function(message){
      var activities = this.get("sortedActivities");
      var unique = this._eventHandlers._activityUnique;
      if(!activities.length || unique(activities, message)){
        var activity = this._eventHandlers._activity(message, "reopened");
        activities.pushObject(activity);
      }
    },
    //This method only works for client-built activities
    _activityUnique: function(activities, message){
      var activity = activities.get("lastObject");
      return activity.created_at !== message.issue.updated_at;
    },
    _activity: function(message, event){
      var issue = message.issue;
      return {
        id: issue.id,
        url: issue.url,
        event: event,
        created_at: issue.updated_at,
        actor: issue.user
      }
    }
  }
});

export default IssueSubscriptionMixin;
