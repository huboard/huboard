var ColumnCountController = Ember.ObjectController.extend({
  needs: ["index"],
  issuesCount: function(){
    var index = this.get("model.index");
    var issues = this.get("controllers.index.model.combinedIssues").filter(function(i){
      return i.current_state.index === index;

    })
    return issues.length;
  }.property("controllers.index.model.combinedIssues.@each.current_state"),
  isOverWip: function(){
    var wip = this.get('model.wip')
    return wip && this.get("issuesCount") > wip;
  }.property("issuesCount")
})

module.exports = ColumnCountController;

