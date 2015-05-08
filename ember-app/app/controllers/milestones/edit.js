import Ember from 'ember';

var MilestonesEditController = Ember.ObjectController.extend({
  needs: ["application"],
  dueDate: function(){
    return this.get("model.due_on");
  }.property("model.due_on"),
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
    var boards = this.get("controllers.application.model._linkedBoards");
    var matches = _.filter(boards, board => {
      return _.find(board.milestones, milestone => {
        return self.get("model.originalTitle") === milestone.title;
      });
    });

    matches.forEach(board => {
      this.get("model").saveLinkedEdit(board, this.get("model.originalTitle"));
    });
  }
});

export default MilestonesEditController;
