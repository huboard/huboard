var IssuesEditController = Ember.ObjectController.extend({
  needs: ["index"],
  actions: {
    labelsChanged: function () {
       Ember.run.once(function () {
         this.get("model").updateLabels()
       }.bind(this));
    },
    submitComment: function () {
      var comments = this.get("model.activities.comments");

      this.set("processing", true);

      this.get("model").submitComment(this.get("commentBody"))
        .then(function(comment){
          comments.pushObject(comment);

         Ember.run.once(function () {
            this.set("commentBody", "")
            this.set("processing", false);
         }.bind(this));

          return comment;
         }.bind(this))
    }
  },
  commentBody: null,
  isValid: function () {
    return this.get("commentBody");
  }.property("commentBody"),
  disabled: function () {
      return this.get("processing") || !this.get("isValid");
  }.property("processing","isValid"),
  _events : function () {
     var events = this.get("model.activities.events");
     return events.map(function (e){return _.extend(e, {type: "event" }) })
  }.property("model.activities.events.@each"),
  _comments : function () {
     var comments = this.get("model.activities.comments");
     return comments.map(function (e){ return _.extend(e, {type: "comment" }) })
  }.property("model.activities.comments.@each"),
  sortedActivities: function () {
    var events = this.get("_events"),
        comments = this.get("_comments");
    
    return _.union(events,comments)
      .sort(function (a, b) {
        return a.created_at.localeCompare(b.created_at); 
      });
  }.property("_events", "_comments")
});

module.exports = IssuesEditController;

