var MilestoneColumnController = Ember.ObjectController.extend({
  needs: ["milestones"],
  getIssues: function () {
    var issues = this.get("controllers.milestones.model.issues").
      filter(this.get("filterBy"));
    return issues;

  },
  issues: function() {
    return this.getIssues();
  }.property("controllers.milestones.forceRedraw"),
  cardMoved : function (cardController, index){
    cardController.send("assignMilestone",index,  this.get("model.milestone"));

  }
})
module.exports = MilestoneColumnController;
