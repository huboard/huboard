var BufferedController = require("../buffered_controller");


var IssueTitleController = BufferedController.extend({
  needs: ["issue"],
  isCollaboratorBinding: "App.repo.is_collaborator",
  isLoggedInBinding: "App.loggedIn",
  currentUserBinding: "App.currentUser",
  isEditing: false,
  disabled: false,
  canEdit: function(){
    return this.get("isLoggedIn") &&
      ( this.get("isCollaborator") || (this.get("currentUser.id") === this.get("model.user.id")) );

  }.property('{isCollaborator,isLoggedIn,currentUser}'),
  actions: {
    edit: function(){
      this.set("isEditing", true);
    },
    save: function() {
      var controller = this,
        url = "/api/" + this.get("controllers.issue.model.repo.full_name") + "/issues/" + this.get("model.number");

      this.get('bufferedContent').applyBufferedChanges();

      controller.set("disabled", true);

      Ember.$.ajax({
        url: url,
        type: "PUT",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({title: this.get("model.title")}),
        success: function(response){
          controller.set("disabled", false);
          controller.set("model.title", response.title);
          controller.set("isEditing", false);
        }
      })
    },

    cancel: function() {
      this.get('bufferedContent').discardBufferedChanges();
      this.set("isEditing", false);
    }
  }
})

module.exports = IssueTitleController;
