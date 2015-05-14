import Ember from 'ember';

var MilestonesCreateController = Ember.ObjectController.extend({
  needs: ["application"],
  errors: false,
  clearErrors: function(){
    this.set("errors", false);
  }.observes('model.title', 'model.description', 'model.due_on'),
  dueDate: function(){
    return this.get("model.due_on");
  }.property("model.due_on"),
  actions: {
    submit: function() {
      var controller = this;
      this.set("processing",true);
      this.get("model").saveNew().then(function(milestone){
         controller.send("milestoneCreated", milestone);
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
  }.property("model.title")
});

export default MilestonesCreateController;
