var SocketMixin = require("../mixins/socket");

var CardController = Ember.ObjectController.extend(SocketMixin,{
  needs: ["application"],
  columns: function() {
    return this.get("controllers.application.model.board.columns")
  }.property("controllers.application.model.board.columns"),
  sockets: {
    config: {
      messagePath: "issueNumber",
      channelPath: "repositoryName"
    },
    milestone_changed: function(message) {
       this.get("model").set("milestone", message.issue.milestone)
       Ember.run.once(function () {
         this.send("forceRepaint", "milestones");
       }.bind(this));
    },
    issue_status_changed: function(message){
       this.get("model").set("_data", message.issue._data)
    },
    issue_archived: function(){
      this.get('model').set('isArchived', true);
    },
    issue_closed: function(message) {
       this.get("model").set("state", message.issue.state)
    },
    assigned: function(message) {
       this.get("model").set("assignee", message.issue.assignee)
    },
    moved: function (message) {
       this.get("model").set("current_state", message.issue.current_state)
       this.get("model").set("_data", message.issue._data)
       Ember.run.once(function () {
         this.send("forceRepaint", "index");
       }.bind(this));
    },
    reordered: function (message) {
       this.get("model").set("current_state", message.issue.current_state)
       this.get("model").set("_data", message.issue._data)
       Ember.run.once(function () {
         this.send("forceRepaint", "index");
       }.bind(this));
    }
  },
  issueNumber: function () {
     return this.get("model.number");
  }.property(),
  repositoryName: function () {
     var repo = this.get("model.repo.name"),
        login = this.get("model.repo.owner.login");

    return login  + "/" + repo;
  }.property(),
  actions : {
    moved: function (index, column){
       return this.get("model").reorder(index, column);
    },
    assignMilestone: function(order, milestone) {
      return this.get("model").assignMilestone(order, milestone);
    },
    assignUser: function(login){
      return this.get("model").assignUser(login);
    },
    fullscreen: function () {
      this.send("openIssueFullscreen", this.get("model"));
    },
    close: function (issue){
      return this.get("model").close();
    }
  },
  canArchive: function () {
    return this.get("model.state") === "closed"
      && App.get("loggedIn") && App.get("repo.is_collaborator");
  }.property("model.state"),
  cardLabels: function () {
      return this.get("model.other_labels").map(function(l){
        return Ember.Object.create(_.extend(l,{customColor: "-x"+l.color}));
      });
  }.property("model.other_labels.@each")
});

module.exports = CardController;
