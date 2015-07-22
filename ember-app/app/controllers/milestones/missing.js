import Ember from 'ember';

var MilestonesMissingController = Ember.Controller.extend({
  needs: ['milestones'],
  linkedRepos: Ember.computed.alias("controllers.milestones.model.linkedRepos"),
  card: Ember.computed.alias("model.card"),
  column: Ember.computed.alias("model.column"),
  disabled: false,
  actions: {
    closeModal: function(){
      if (this.get('disabled')) {
        return false;
      }
      this.get("model").onReject();
      return true;
    },
    createTheMilestone: function() {
      var controller = this,
        milestone = {
          title: this.get("column.title"),
          description: this.get("column.milestone.description"),
        },
        owner = this.get("card.repo.owner.login"),
        name = this.get("card.repo.name");

      // GH API freaks out if you send a null due_on date
      if (this.get("column.milestone.due_on")) {
        milestone.due_on = this.get("column.milestone.due_on");
      }
          
      controller.set("disabled", true);

      Ember.$.ajax({
        url: "/api/" + owner + "/" + name + "/milestones",
        type: "POST",
        dataType: 'json',
        data: {milestone: milestone},
        success: function(response) {
          controller.get("linkedRepos").forEach(function(repo){
            if (repo.full_name === controller.get("card.repo.full_name")){
              repo.milestones.pushObject(response);
            }
          });
          controller.get("model").onAccept(response);
          controller.set("disabled", false);
          controller.get('target').send('closeModal');
        }
      });
    }
  }

});

export default MilestonesMissingController;
