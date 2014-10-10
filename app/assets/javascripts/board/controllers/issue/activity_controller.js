var BufferedController = require("../buffered_controller");


var IssueActivityController = BufferedController.extend({
  needs: ["issue"],
  mentions: Ember.computed.alias("controllers.issue.mentions"),
  isEditing: false,
  actions: {
    edit: function(){
      this.set("isEditing", true);
    },
    save: function() {
      this.get('bufferedContent').applyBufferedChanges();
      this.set("isEditing", false);
      // do stuff
    },

    cancel: function() {
      this.get('bufferedContent').discardBufferedChanges();
      this.set("isEditing", false);
    }
  }
})

module.exports = IssueActivityController;
