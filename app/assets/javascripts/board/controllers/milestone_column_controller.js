var MilestoneColumnController = Ember.ObjectController.extend({
  needs: ["milestones", "application", "index"],
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
  isFirstColumn: function(){
    return this.get("model.title") === "No milestone";
  }.property("model.title"),
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
  topOrderNumber: function(){
    var first = this.get("controllers.application.model.board").topIssue();
    var issues = this.get("issues");
    if(issues.length){
      var order = { milestone_order: issues.get("firstObject._data.milestone_order") / 2};
      if(first){
        order.order = first._data.order / 2;
      }
      return order;
    } else {
      if(first){
        return { order: first._data.order / 2 };
      }
      return {};
    }
  }.property("issues.@each", "controllers.milestones.forceRedraw"),
  newIssue: function(){
    var newModel = App.Issue.createNew();
    newModel.set('milestone', this.get("model.milestone"));
    return newModel;
  }.property(),
  isCreateVisible: function(){
    return App.get("repo.is_collaborator") || 
      App.get('loggedIn') && this.get('isFirstColumn');
  }.property('isFirstColumn'),
  cardMoved : function (cardController, index, onCancel){
    if (this.get('model.noMilestone')) {
      return cardController.send("assignMilestone",index, null);
    }

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
