var ColumnController = Ember.ObjectController.extend({
  needs: ["index", "application"],
  isLastColumn: function(){
    return this.get("controllers.index.columns.lastObject.name") === this.get("model.name");
  }.property("controllers.index.columns.lastObject"),
  isFirstColumn: function(){
    return this.get("controllers.index.columns.firstObject.name") === this.get("model.name");
  }.property("controllers.index.columns.firstObject"),
  isCreateVisible: Ember.computed.alias("isFirstColumn"),
  isCollapsed: function(key, value) {
    if(arguments.length > 1) {
      this.set("settings.taskColumn" + this.get("model.index") + "Collapsed", value);
      return value;
    } else {
      return this.get("settings.taskColumn" + this.get("model.index") + "Collapsed");
    }
  }.property(),
  isHovering: false,
  dragging: false,
  cardMoved : function (cardController, index){
    this.get("controllers.index.model").moveIssue(cardController, this, index);

    //cardController.send("moved", index, this.get("model"))
  },
  topOrderNumber: function(){
    var issues = this.get("issues");
    if(issues.length){
      return { order: issues.get("firstObject._data.order") / 2 };
    } else {
      return {};
    }
  }.property("issues.@each", "controllers.index.forceRedraw"),
  newIssue: function(){
    return App.Issue.createNew();
  }.property()
})

module.exports = ColumnController;
