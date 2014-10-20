var MilestoneColumnController = Ember.ObjectController.extend({
  needs: ["milestones"],
  getIssues: function () {
    var issues = this.get("controllers.milestones.model.combinedIssues")
      .filter(function(i) {
        // FIXME: this flag is for archived issue left on the board.
        return !i.get("isArchived");
      }).sort(function (a, b){
        return a._data.milestone_order - b._data.milestone_order;
      })
      .filter(this.get("filterBy"));
    return issues;

  },
  isCollapsed: function(key, value) {
    if(arguments.length > 1) {
      this.set("settings.milestoneColumn" + this.get("model.milestone.number") + "Collapsed", value);
      return value;
    } else {
      return this.get("settings.milestoneColumn" + this.get("model.milestone.number") + "Collapsed");
    }
  }.property(),
  issues: function() {
    return this.getIssues();
  }.property("controllers.milestones.forceRedraw"),
  cardMoved : function (cardController, index){
    cardController.send("assignMilestone",index,  this.get("model.milestone"));

  }
})
module.exports = MilestoneColumnController;
