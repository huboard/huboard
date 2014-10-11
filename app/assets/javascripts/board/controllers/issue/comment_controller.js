var BufferedController = require("../buffered_controller");


var IssueActivityController = BufferedController.extend({
  needs: ["issue"],
  mentions: Ember.computed.alias("controllers.issue.mentions"),
  isEditing: false,
  disabled: false,
  actions: {
    edit: function(){
      this.set("isEditing", true);
    },
    save: function() {
      var controller = this,
        url = "/api/" + this.get("controllers.issue.model.repo.full_name") + "/issues/comments/" + this.get("model.id");

      this.get('bufferedContent').applyBufferedChanges();

      controller.set("disabled", true);

      Ember.$.ajax({
        url: url,
        type: "PUT",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({comment: this.get("model")}),
        success: function(response){
          controller.set("disabled", false);
          controller.set("model.body_html", response.body_html);
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

module.exports = IssueActivityController;
