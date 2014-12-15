var IssuesEditController = Ember.ObjectController.extend({
  needs: ["application"],
  columns: Ember.computed.alias("controllers.application.model.board.columns"),
  isReady: function(key, value){
    if(value !== undefined) {
      if(value) {
        this.set("model.customState", "ready");
        return true; 
      } else {
        this.set("model.customState", "");
        return false;
      }
    } else {
      return this.get("model.customState") == "ready";
    }
  }.property("model.customState", "model._data.custom_state"),
  isBlocked: function(key, value){
    if(value !== undefined) {
      if(value) {
        this.set("model.customState", "blocked");
        return true;
      } else {
        this.set("model.customState", "");
        return false;
      }
      return;
    } else {
      return this.get("model.customState") == "blocked";
    }
  }.property("model.customState", "model._data.custom_state"),
  actions: {
    labelsChanged: function () {
       Ember.run.once(function () {
         this.get("model").updateLabels()
       }.bind(this));
    },
    moveToColumn: function(column) {
      if(!App.get("repo.is_collaborator")) {
        return false;
      }
      this.get("model").reorder(this.get("model._data.order"),column).then(function() {
        this.send("forceRepaint","index");
      }.bind(this));
      Ember.run.next(this, "send", "forceRepaint", "index")
    },
    assignUser: function(login){
      return this.get("model").assignUser(login);
    },
    assignMilestone: function(milestone) {
      this.get("model").assignMilestone(this.get("model.number"), milestone);
      Ember.run.next(this, "send", "forceRepaint", "milestones")
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
  allActivities: Ember.computed.union("model.activities.{comments,events}"),
  mentions: function (){
    var union = _.union(this.get('controllers.application.model.board.assignees'),this.get('allActivities').mapBy('user'))
    return _.uniq(_.compact(union), function(i){
      return i.login 
    });
  }.property('controllers.application.model.board.assignees','allActivities')
});

module.exports = IssuesEditController;

