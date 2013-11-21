var IssuesEditController = Ember.ObjectController.extend({
  needs: ["index"],
  actions: {
    labelsChanged: function () {
       Ember.run.once(function () {
         this.get("model").updateLabels()
       }.bind(this));
    }
  },
  otherLabels : Ember.computed.alias("controllers.index.other_labels"),
  _events : function () {
     var events = this.get("model.activities.events");
     return events.map(function (e){return _.extend(e, {type: "event" }) })
  }.property("model.activities.events"),
  _comments : function () {
     var comments = this.get("model.activities.comments");
     return comments.map(function (e){ return _.extend(e, {type: "comment" }) })
  }.property("model.activities.comments"),
  sortedActivities: function () {
    var events = this.get("_events"),
        comments = this.get("_comments");
    
    return _.union(events,comments).sort(function (a, b){return a.created_at.localeCompare(b.created_at); });
  }.property("_events", "_comments")
});

module.exports = IssuesEditController;

