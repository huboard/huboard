import SocketMixin from 'app/mixins/socket';
import Ember from 'ember';


var CardController = Ember.Controller.extend(SocketMixin,{
  needs: ["application"],
  isCollaborator: function() {
    return this.get("model.repo.is_collaborator");
  }.property("model.repo.is_collaborator"),
  columns: function() {
    return this.get("controllers.application.model.board.columns");
  }.property("controllers.application.model.board.columns"),
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
    close: function (issue){
      return issue.close();
    }
  },
  isLast: function(){
    return this.get("model.current_state.is_last") &&
      this.get("isCollaborator");
  }.property("model.current_state", "isCollaborator"),
  canArchive: function () {
    this.get("isCollaborator");
    return this.get("model.state") === "closed" &&
      App.get("loggedIn") && this.get("isCollaborator");
  }.property("model.state", "isCollaborator"),
  cardLabels: function () {
      return this.get("model.other_labels").map(function(l){
        return Ember.Object.create(_.extend(l,{customColor: "-x"+l.color}));
      });
  }.property("model.other_labels.@each")
});

export default CardController;
