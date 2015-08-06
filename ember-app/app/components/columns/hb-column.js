import Ember from 'ember';
import SortableMixin from "app/mixins/cards/sortable";

var HbColumnComponent = Ember.Component.extend(SortableMixin, {
  classNames: ["column"],
  classNameBindings:["isCollapsed:hb-state-collapsed","isHovering:hovering", "isTaskColumn:hb-task-column", "isTaskColumn:task-column"],
  isTaskColumn: true,
  cards: Ember.A(),

  columns: function(){
    return this.get("columnComponents").map(function(c){
      return c.get("model");
    });
  }.property("columnComponents.[]"),
  sortedIssues: function(){
    var column = this.get("model");
    var issues = this.get("issues").filter(function(i){
      return i.current_state.index === column.index;
    }).filter(function(i) {
      return !i.get("isArchived");
    }).sort(this.sortStrategy);
    return issues;
  }.property("issues.@each.{columnIndex,order}"),
  sortStrategy: function(a,b){
    if(a._data.order === b._data.order){
      if(a.repo.full_name === b.repo.full_name){
        return a.number - b.number;
      }
      return a.repo.full_name - b.repo.full_name;
    }
    return a._data.order - b._data.order;
  },
  moveIssue: function(issue, order){
    var self = this;
    this.get("sortedIssues").removeObject(issue);
    Ember.run.schedule("afterRender", self, function(){
      issue.reorder(order, self.get("model"));
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
  topOrderNumber: function(){
    var issues = this.get("sortedIssues");
    var milestone_issues = this.get("issues").sort(function(a,b){
      return a._data.milestone_order - b._data.milestone_order;
    });
    if(issues.length){
      return {
        order: issues.get("firstObject._data.order") / 2,
        milestone_order: milestone_issues.get("firstObject._data.milestone_order") / 2
      };
    } else {
      return {};
    }
  }.property("sortedIssues.@each"),

  registerWithController: function(){
    var self = this;
    Ember.run.schedule("afterRender", this, function(){
      self.attrs.registerColumn(self);
    });
  }.on("didInsertElement"),
  unregisterWithController: function(){
    this.attrs.unregisterColumn(this);
  }.on("willDestroyElement"),
  wireupIsCollapsed: function(){
    var self = this;
    this.$(".collapsed").click(function(){
      self.toggleProperty("isCollapsed");
    });
  }.on("didInsertElement"),

  disableModalOnHrefs: function () {
    this._super();
    this.$("a, .clickable").on("click.hbcard", function (ev){ ev.stopPropagation(); } );
  }.on("didInsertElement"),
  tearDownEvents: function () {
    this.$("a, .clickable").off("click.hbcard");
    return this._super();
  }.on("willDestroyElement") 
});

export default HbColumnComponent;
