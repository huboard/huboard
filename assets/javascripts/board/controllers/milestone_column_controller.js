var MilestoneColumnController = Ember.ObjectController.extend({
  needs: ["milestones"],
  getIssues: function () {
    var issues = this.get("controllers.milestones.model.issues").
      filter(this.get("filterBy"));
    return issues;

  },
  issues: function() {
    return this.getIssues();
  }.property()
})
module.exports = MilestoneColumnController;
