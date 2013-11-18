var IssuesEditController = Ember.ObjectController.extend({
  needs: ["index"],
  otherLabels : Ember.computed.alias("controllers.index.other_labels")
});

module.exports = IssuesEditController;

