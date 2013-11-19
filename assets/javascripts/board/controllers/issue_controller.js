var IssuesEditController = Ember.ObjectController.extend({
  needs: ["index"],
  otherLabels : Ember.computed.alias("controllers.index.other_labels"),
  sortedActivities: function () {
    debugger
    return this.get("model.activities.events");
  }.property("model.activities")
});

module.exports = IssuesEditController;

