import Ember from 'ember';
import CreateIssue from 'app/models/forms/create-issue';

var ColumnController = Ember.Controller.extend({
  needs: ["index", "application"],
  style: Ember.computed.alias("controllers.index.column_style"),
  isLastColumn: function(){
    return this.get("controllers.index.model.columns.lastObject.name") === this.get("model.name");
  }.property("controllers.index.model.columns.lastObject"),
  isFirstColumn: function(){
    return this.get("controllers.index.model.columns.firstObject.name") === this.get("model.name");
  }.property("controllers.index.model.columns.firstObject"),
  isCreateVisible: Ember.computed.alias("isFirstColumn"),
  isCollapsed: Ember.computed({
    get: function(){
      return this.get("settings.taskColumn" + this.get("model.index") + "Collapsed");
    },
    set: function(key, value){
      this.set("settings.taskColumn" + this.get("model.index") + "Collapsed", value);
      return value;
    }
  }).property(),
  isHovering: false,
  dragging: false,
  cardMoved : function (cardController, index){
    cardController.send("moved", index, this.get("model"));
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
    return CreateIssue.createNew();
  }.property()
});

export default ColumnController;
