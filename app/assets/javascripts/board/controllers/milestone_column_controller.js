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
  newIssue: function(){
    var newModel = App.Issue.createNew();
    newModel.set('milestone', this.get("model.milestone"));
    return newModel;
  }.property(),
  isCreateVisible: true,
  cardMoved : function (cardController, index, onCancel){
    var columnController = this;

    var equalsA = function(a) {
      return function(b) {
        return _.isEqual(a, b.repo);
      }
    }(cardController.get("model.repo"));

    var milestone = this.get('model.group').find(equalsA);

    if (milestone) {
      cardController.send("assignMilestone",index, milestone);
    } else {

      this.send("createMilestoneOrAbort", {
        cardController: cardController,
        index: index,
        columnController: this,
        onAccept: function(milestone) {
          // save the issue with the newly created milestone
          cardController.send("assignMilestone",index, milestone);
          columnController.get("model.group").pushObject(milestone);
        },
        onReject: function(){
          // move the card to where it came from
          onCancel();
        }
      })
    }
  }
})
module.exports = MilestoneColumnController;
