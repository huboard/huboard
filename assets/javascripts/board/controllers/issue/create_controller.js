var IssuesCreateController = Ember.ObjectController.extend({
  needs: ["index"],
  actions: {
    submit: function() {
      var controller = this;
      this.set("processing",true)
      this.get("model").saveNew().then(function(issue){
         var issues = controller.get("controllers.index.model.issues")
         issues.pushObject(issue);
         Ember.run.schedule('afterRender', controller, function () {
           this.get("controllers.index").incrementProperty("forceRedraw");
           this.send("closeModal")
           this.set("processing",false)
         })
      });
    }
  },
  isCollaboratorBinding: "App.repo.is_collaborator",
  otherLabelsBinding: "controllers.index.model.other_labels",
  columnsBinding: "controllers.index.model.columns",
  disabled: function () {
      return this.get("processing") || !this.get("isValid");
  }.property("processing","isValid"),
  isValid: function () {
    return this.get("model.title");
  }.property("model.title")

});

module.exports = IssuesCreateController;

