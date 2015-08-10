import Ember from 'ember';

var IssueSubscriptionMixin = Ember.Mixin.create({
  hbsubscriptions: {
    channel: "{model.repo.full_name}",
    "issues.{model.number}.issue_closed": "closed",
    "issues.{model.number}.issue_reopened": "opened",
    "issues.{model.number}.issue_commented": "commented"
  },
  hbsubscribers: {
    commented: function(message){
      var activities = this.get("sortedActivities");
      var unique = this.hbsubscribers._activityUnique;
      if(!activities.length || unique(activities, message.comment.updated_at)){
        var comment = this.hbsubscribers._comment(message);
        this.get("model.activities.comments").pushObject(comment);
      }
    },
    closed: function(message){
      var activities = this.get("sortedActivities");
      var unique = this.hbsubscribers._activityUnique;
      if(!activities.length || unique(activities, message.issue.updated_at)){
        var activity = this.hbsubscribers._activity(message, "closed");
        this.get("model.activities.events").pushObject(activity);
      }
    },
    opened: function(message){
      var activities = this.get("sortedActivities");
      var unique = this.hbsubscribers._activityUnique;
      if(!activities.length || unique(activities, message.issue.updated_at)){
        var activity = this.hbsubscribers._activity(message, "reopened");
        this.get("model.activities.events").pushObject(activity);
      }
    },
    //This method only works for client-built activities
    _activityUnique: function(activities, timestamp){
      var activity = activities.get("lastObject");
      return activity.created_at !== timestamp;
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
    },
    _comment: function(message){
      var issue = message.issue;
      return {
        body: message.comment.body,
        body_html: message.comment.body_html,
        body_text: message.comment.body_text,
        html_url: message.comment.html_url,
        issue_url: message.comment.issue_url,
        created_at: issue.updated_at,
        user: issue.user
      }
    }
  }
});

export default IssueSubscriptionMixin;
