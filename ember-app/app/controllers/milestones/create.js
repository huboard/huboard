import Ember from 'ember';

var MilestonesCreateController = Ember.ObjectController.extend({
  needs: ["application"],
  dueDate: "",
  actions: {
    submit: function() {
      var controller = this;
      this.set("processing",true);
      this.get("model").saveNew().then(function(milestone){
         controller.send("milestoneCreated", milestone);
         controller.set("processing",false);
      });
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
