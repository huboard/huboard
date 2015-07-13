import Ember from 'ember';
import SortableMixin from "app/mixins/cards/sortable";

var HbColumnComponent = Ember.Component.extend(SortableMixin, {
  classNameBindings:["isCollapsed:hb-state-collapsed","isHovering:hovering"],
  classNames: ["hb-task-column","column","task-column"],
  cards: Ember.A(),

  columns: function(){
    return this.get("columnComponents").map(function(c){
      return c.get("model");
    });
  }.property("columnComponents.@each.model"),
  sortedIssues: function(){
    var column = this.get("model");
    var issues = this.get("issues").filter(function(i){
      return i.current_state.index === column.index;
    })
    .filter(function(i) {
      return !i.get("isArchived");
    }).sort(function(a,b){
      return a._data.order - b._data.order
    });
    return issues;
  }.property("issues.@each.{columnIndex,order}"),
  moveIssue: function(issue, order){
    var self = this;
    this.get("sortedIssues").removeObject(issue);
    Ember.run.schedule("afterRender", self, function(){
      issue.set("_data.order", order);
      issue.set("current_state", self.get("model"));
    });
  },

  isCollapsed: Ember.computed({
    get: function(){
      return this.get("settings.taskColumn" + this.get("model.index") + "Collapsed");
    },
    set: function(key, value){
      this.set("settings.taskColumn" + this.get("model.index") + "Collapsed", value);
      return value;
    }
  }).property(),
  isLastColumn: function(){
    return this.get("columns.lastObject.name") === this.get("model.name");
  }.property("columns.lastObject"),
  isFirstColumn: function(){
    return this.get("columns.firstObject.name") === this.get("model.name");
  }.property("columns.firstObject"),
  isCreateVisible: Ember.computed.alias("isFirstColumn"),
  //isHovering: false,
  //dragging: false,
  topOrderNumber: function(){
    var issues = this.get("sortedIssues");
    return issues.get("firstObject._data.order") / 2;
  }.property("sortedIssues.@each"),

  registerWithController: function(){
    this.sendAction("registerColumn", this);
  }.on("didInsertElement"),
  wireupIsCollapsed: function(){
    var self = this;
    this.$(".collapsed").click(function(){
      self.toggleProperty("isCollapsed");
    });
  }.on("didInsertElement"),

  actions: {
    createNewIssue: function(issue){
      this.attrs.createNewIssue(issue);
    },
    createFullscreenIssue: function(issue, order){
      this.attrs.createFullscreenIssue(issue, order);
    }
  }
});

export default HbColumnComponent;
