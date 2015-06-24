import WrapperView from 'app/views/card-wrapper';
import Ember from 'ember';


var CollectionView = Ember.CollectionView.extend({
  tagName:"ul",
  classNames: ["sortable"],
  classNameBindings:["isHovering:ui-sortable-hover"],
  attributeBindings: ["style"],
  style: function(){
    if(this.get("controller.style")){
      return this.get("controller.style").htmlSafe();
    }
    return "".htmlSafe();
  }.property("controller.style"),
  content: Ember.computed.alias("controller.issues"),
  isHovering: false,
  itemViewClass: WrapperView
});
var ColumnView = Ember.ContainerView.extend({
  classNameBindings:["isCollapsed:hb-state-collapsed","isHovering:hovering"],
  classNames: ["hb-task-column","column","task-column"],
  isCollapsed: Ember.computed.alias("controller.isCollapsed"),
  isHovering: Ember.computed.alias("controller.isHovering"),
  init: function(){
    this._super();
    this.pushObject(this.createChildView(this.headerView));
    this.pushObject(this.createChildView(this.quickIssueView));
    this.pushObject(this.createChildView(CollectionView));
    this.pushObject(this.createChildView(this.collapsedView));
  },
  headerView: Ember.View.extend({
    tagName: "h3",
    templateName: "columnHeader",
    click: function(){
      this.get("controller").toggleProperty('isCollapsed');
    }
  }),
  quickIssueView: Ember.View.extend({
    templateName: "quickIssue",
    classNames: ["create-issue"],
    isVisible: function(){
      return this.get('controller.isFirstColumn') && App.get('loggedIn');
    }.property('controller.isFirstColumn'),
  }),
  collapsedView: Ember.View.extend({
    classNames:["collapsed"],
    click: function(){
      this.get("controller").toggleProperty('isCollapsed');
    }
  }),

});

export default ColumnView;
