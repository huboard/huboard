import Ember from 'ember';

var MilestonesMissingController = Ember.Controller.extend({
  needs: ['milestones'],
  linkedRepos: Ember.computed.alias("controllers.milestones.model.linkedRepos"),
  disabled: false,
  actions: {
    closeModal: function(){
      if (this.get('disabled')) {
        return false;
      }
      this.get("model.onReject").call(this.get("columnController"), this);
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
        milestone.due_on = this.get("columnController.milestone.due_on");
      }
          
      controller.set("disabled", true);

      Ember.$.ajax({
        url: "/api/" + owner + "/" + name + "/milestones",
        type: "POST",
        dataType: 'json',
        data: {milestone: milestone},
        success: function(response) {
          controller.get("linkedRepos").forEach(function(repo){
            if (repo.full_name === controller.get("cardController.model.repo.full_name")){
              repo.milestones.pushObject(response);
            }
          });
          controller.get("model.onAccept").call(controller.get("columnController"), response);
          controller.set("disabled", false);
          controller.get('target').send('closeModal');
        }
      });
    }
  }

});

export default MilestonesMissingController;
