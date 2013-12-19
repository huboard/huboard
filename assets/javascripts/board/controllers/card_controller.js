var SocketMixin = require("../mixins/socket");

var CardController = Ember.ObjectController.extend(SocketMixin,{
  needs:["index"],
  sockets: {
    config: {
      messagePath: "issueNumber",
      channelPath: "repositoryName"
    },
    Moved: function (message) {
       this.get("model").set("current_state", message.issue.current_state)
       this.get("model").set("_data", message.issue._data)
       Ember.run.once(function () {
         this.get("controllers.index").incrementProperty("forceRedraw");
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
    dragged: function (column) {
      return this.get("model").drag(column);
    },
    moved: function (index, column){
       return this.get("model").reorder(index, column);
    },
    fullscreen: function(){
      this.transitionToRoute("issue", this.get("model"))
    },
    close: function (issue){
      return this.get("model").close();
    }
  },
  canArchive: function () {
    return this.get("model.state") === "closed";
  }.property("model.state"),
  cardLabels: function () {
      return this.get("model.other_labels").map(function(l){
        return Ember.Object.create(_.extend(l,{customColor: "-x"+l.color}));
      });
  }.property("model.other_labels.@each")
});

module.exports = CardController;
