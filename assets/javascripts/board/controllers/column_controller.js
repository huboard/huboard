var ColumnController = Ember.ObjectController.extend({
  actions: {
    archive: function (issue) {
      this.get("controllers.index.issues").removeObject(issue);
      issue.archive();
    }
  },
  needs: ["index"],
  style: Ember.computed.alias("controllers.index.column_style"),
  isLastColumn: function(){
    return this.get("controllers.index.columns.lastObject.name") === this.get("model.name");
  }.property("controllers.index.columns.lastObject"),
  isFirstColumn: function(){
    return this.get("controllers.index.columns.firstObject.name") === this.get("model.name");
  }.property("controllers.index.columns.firstObject"),
  isCollapsed: function() {
    return this.get("isFirstColumn");
  }.property(),
  isHovering: false,
  getIssues: function(){
    var index = this.get("model.index");
    var column = this.get("model");
    var issues = this.get("controllers.index.model").combinedIssues().filter(function(i){
      return i.current_state.index === index;

    }).map(function (i){
       i.set("current_state", column);
       return i;
    }).sort(function (a, b){
       return a._data.order - b._data.order;
    });
    return issues;
  },
  issues: function(){
    return this.getIssues();
  }.property("controllers.index.forceRedraw"),
  issuesObserver : function () {
    console.log("dragginObserver")
  }.observes("controllers.index.issues.@each.current_state"),
  dragging: false,
  cardReceived: function(view) {
    view = Em.View.views[$(view.item).find("> div").attr("id")]
    view.get("controller").send("dragged", this.get("model"));
  },
  cardMoved : function (cardController, index){
    cardController.send("moved", index, this.get("model"))
  }
})

module.exports = ColumnController;
