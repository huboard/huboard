var MilestoneColumnController = Ember.ObjectController.extend({
  needs: ["milestones"],
  getIssues: function () {
    var issues = this.get("controllers.milestones.model.issues").
      filter(this.get("filterBy"));
    return issues;

  },
  isCollapsed: function(key, value) {
    if(arguments.length > 1) {
      debugger
      this.set("settings.milestoneColumn" + this.get("model.milestone.number") + "Collapsed", value);
      return value;
    } else {
      debugger
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
