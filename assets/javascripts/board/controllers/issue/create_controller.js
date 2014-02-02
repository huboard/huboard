var IssuesCreateController = Ember.ObjectController.extend({
  needs: ["application"],
  actions: {
    submit: function() {
      var controller = this;
      this.set("processing",true)
      this.get("model").saveNew().then(function(issue){
         controller.send("issueCreated", issue)
         controller.set("processing",false)
      });
    }
  },
  isCollaboratorBinding: "App.repo.is_collaborator",
  otherLabelsBinding: "controllers.application.model.board.other_labels",
  columnsBinding: "controllers.application.model.board.columns",
  disabled: function () {
      return this.get("processing") || !this.get("isValid");
  }.property("processing","isValid"),
  isValid: function () {
    return this.get("model.title");
  }.property("model.title")

});

module.exports = IssuesCreateController;

