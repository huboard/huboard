var MilestonesMissingController = Ember.ObjectController.extend({
  disabled: false,
  actions: {
    closeModal: function(){
      if (this.get('disabled')) {
        return false;
      }
      this.get("model.onReject").call(this.get("columnController"), this)
      return true;
    },
    createTheMilestone: function() {
      var controller = this,
        milestone = {
          title: this.get("columnController.title"),
          description: this.get("columnController.milestone.description"),
        },
        owner = this.get("cardController.model.repo.owner.login"),
        name = this.get("cardController.model.repo.name");

      // GH API freaks out if you send a null due_on date
      if (this.get("columnController.milestone.due_on")) {
        milestone.due_on = this.get("columnController.milestone.due_on")
      }
          
      controller.set("disabled", true);

      $.ajax({
        url: "/api/" + owner + "/" + name + "/milestones",
        type: "POST",
        data: {milestone: milestone},
        success: function(response) {
          controller.get("model.onAccept").call(controller.get("columnController"), response)
          controller.set("disabled", false);
          controller.get('target').send('closeModal')
        }
      });
    }
  }

});

module.exports = MilestonesMissingController;
