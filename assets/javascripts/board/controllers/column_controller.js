var ColumnController = Ember.ObjectController.extend({
  needs: ["index"],
  style: Ember.computed.alias("controllers.index.column_style"),
  getIssues: function(){
    var name = this.get("model.name");
    var issues = this.get("controllers.index.issues").filter(function(i){
      return i.current_state.name === name;

    })
    return issues;
  },
  issues: function(){
    return this.getIssues();
  }.property(""),
  issuesObserver : function () {
    console.log("dragginObserver")
  }.observes("controllers.index.issues.@each.current_state"),
  dragging: false,
  cardReceived: function(view) {
    view = Em.View.views[$(view.item).find("> div").attr("id")]
    view.get("controller").send("dragged", this.get("model"));
  }
})

module.exports = ColumnController;
