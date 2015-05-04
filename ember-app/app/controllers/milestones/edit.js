import Ember from 'ember';

var MilestonesEditController = Ember.ObjectController.extend({
  needs: ["application"],
  actions: {
    submit: function() {
      var controller = this;
      this.set("processing",true);

      this.get("model").saveEdit().then(function(milestone){
         controller.send("milestoneUpdated", milestone);
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

export default MilestonesEditController;
