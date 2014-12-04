var MilestoneColumnController = Ember.ObjectController.extend({
  needs: ["milestones", "application", "index"],
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
  topOrderNumber: function(){
    if(this.get("issues.length")){
      return { milestone_order: this.get("issues.firstObject._data.milestone_order") / 2 };
    } else {
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
    this.get("controllers.milestones.model").assignMilestone(cardController, this, index, onCancel)
  }
})
module.exports = MilestoneColumnController;
