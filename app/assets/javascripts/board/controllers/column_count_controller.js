var ColumnCountController = Ember.ObjectController.extend({
  needs: ["index"],
  issuesCount: function(){
    var name = this.get("model.name");
    var issues = this.get("controllers.index.issues").filter(function(i){
      return i.current_state.name === name;

    })
    return issues.length;
  }.property("controllers.index.issues.@each.current_state"),
  isOverWip: function(){
    var wip = this.get('model.wip')
    return wip && this.get("issuesCount") > wip;
  }.property("issuesCount")
})

module.exports = ColumnCountController;

