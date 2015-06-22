import Ember from 'ember';

var HbColumnComponent = Ember.Component.extend({
  classNameBindings:["isCollapsed:hb-state-collapsed","isHovering:hovering"],
  classNames: ["hb-task-column","column","task-column"],
  isHovering: false,
  sortedIssues: function(){
    var column = this.get("column");
    var issues = this.get("issues").filter(function(i){
      return i.current_state.index === column.index;
    })
    .filter(function(i) {
      // FIXME: this flag is for archived issue left on the board.
      return !i.get("isArchived");
    })
    .map(function (i){
       i.set("current_state", column);
       return i;
    }).sort(function (a, b){
       return a._data.order - b._data.order;
    });
    return issues;
  }.property("sortedIssues.@each"),
  isCollapsed: Ember.computed({
    get: function(){
      return this.get("settings.taskColumn" + this.get("column.index") + "Collapsed");
    },
    set: function(key, value){
      this.set("settings.taskColumn" + this.get("column.index") + "Collapsed", value);
      return value;
    }
  }).property(),
  isLastColumn: function(){
    return this.get("columns.lastObject.name") === this.get("column.name");
  }.property("columns.lastObject"),
  isFirstColumn: function(){
    return this.get("columns.firstObject.name") === this.get("column.name");
  }.property("columns.firstObject"),
  isCreateVisible: Ember.computed.alias("isFirstColumn"),
  isHovering: false,
  dragging: false,
  //cardMoved : function (cardController, index){
  //  cardController.send("moved", index, this.get("column"));
  //},
  topOrderNumber: function(){
    var issues = this.get("sortedIssues");
    if(issues.length){
      return { order: issues.get("firstObject._data.order") / 2 };
    } else {
      return {};
    }
  }.property("sortedIssues.@each"),
  newIssue: function(){
    return CreateIssue.createNew();
  }.property()
});

export default HbColumnComponent;
