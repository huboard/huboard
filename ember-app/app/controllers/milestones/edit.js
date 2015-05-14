import Ember from 'ember';

var MilestonesEditController = Ember.ObjectController.extend({
  needs: ["milestones"],
  errors: false,
  clearErrors: function(){
    this.set("errors", false);
  }.observes('model.title', 'model.description', 'model.due_on'),
  dueDate: function(){
    return this.get("model.due_on");
  }.property("model.due_on"),
  linkedRepos: Ember.computed.alias("controllers.milestones.model.linkedRepos"),
  actions: {
    submit: function() {
      var controller = this;
      this.set("processing",true);
      this.editLinkedMilestones();

      this.get("model").saveEdit().then(function(milestone){
         milestone.originalTitle = controller.get("model.originalTitle");
         controller.send("milestoneUpdated", milestone);
         controller.set("processing",false);
      }).fail(function(){
         controller.set("processing",false);
         controller.set("errors", true);
      });
    },
    clearDueDate: function(){
      this.set("model.due_on", null);
    }
  },
  isCollaboratorBinding: "App.repo.is_collaborator",
  disabled: function () {
      return this.get("processing") || !this.get("isValid");
  }.property("processing","isValid"),
  isValid: function () {
    return this.get("model.title");
  }.property("model.title"),

  editLinkedMilestones: function(){
    var self = this;
    var boards = this.get("linkedRepos");
    var matches = _.filter(boards, board => {
      return _.find(board.milestones, milestone => {
        return self.get("model.originalTitle") === milestone.title;
      });
    });

    matches.forEach(board => {
      this.get("model")
        .saveLinkedEdit(board, this.get("model.originalTitle"))
        .then(function(milestone){
          self.get("model").saveToBoard(board);
          self.set("linkedRepos", boards.map(function(b){
            if (b.title === board.title){ return board; }
            return b;
          }));
        });
    });
  }
});

export default MilestonesEditController;
