import WrapperView from 'app/views/card-wrapper';
import Ember from 'ember';


var CollectionView = Ember.CollectionView.extend({
  tagName:"ul",
  classNames: ["sortable"],
  classNameBindings:["isHovering:ui-sortable-hover"],
  attributeBindings: ["style"],
  style: Ember.computed.alias("controller.style"),
  content: Ember.computed.alias("controller.issues"),
  isHovering: false,
  visibleElements: function(){
    var issues = _.filter(this.get("content"), function(view){
      return !view.get("isFiltered");
    });
    this.set("controller.visibleIssues", issues);
  }.observes('@each.isFiltered', 'controller.combinedIssues'),
  didInsertElement: function(){
    var that = this;
    this.$().sortable({
      tolerance: 'pointer',
      connectWith:".sortable",
      placeholder: "ui-sortable-placeholder",
      items: "li.is-draggable",
      over: function () {
        that.set("isHovering", true);
      },
      out: function () {
        that.set("isHovering", false);
      },
      activate: function () {
        // that.get("controller").set("isHovering", true);
      },
      deactivate: function() {
        // that.get("controller").set("isHovering", false);
      }, 
      update: function (ev, ui) {

        var findViewData = function (element){
           return Ember.View.views[Ember.$(element).find("> div").attr("id")]
             .get("controller");
        };

        var elements = Ember.$("> li", that.$()),
        index = elements.index(ui.item);

        if(index === -1) { return; }

        var first = index === 0,
        last = index === elements.size() - 1,
        currentElement = Ember.$(ui.item),
        currentData = findViewData(currentElement),
        beforeElement = elements.get(index ? index - 1 : index),
        beforeData = findViewData(beforeElement),
        afterElement = elements.get(elements.size() - 1 > index ? index + 1 : index),
        afterData = findViewData(afterElement),
        before = beforeData.get("model._data.order") || beforeData.get("model.number"),
        after = afterData.get("model._data.order") || afterData.get("model.number");

        if(first && last) {
          that.get("controller").cardMoved(currentData, currentData.get("model.number"));
          return;
        }
        
        if(first) {
          that.get("controller").cardMoved(currentData, (after || 1)/2);
          // dragged it to the top

        } else if (last) {
          // dragged to the bottom
          that.get("controller").cardMoved(currentData, (before + 1));

        }  else {
          that.get("controller").cardMoved(currentData, (((after + before) || 1)/2));
        }
      }
    });
    this._super();

  },
  itemViewClass: WrapperView
});
var ColumnView = Ember.ContainerView.extend({
  classNameBindings:[":hb-task-column",":column",":task-column","isCollapsed:hb-state-collapsed","isHovering:hovering"],
  isCollapsed: Ember.computed.alias("controller.isCollapsed"),
  isHovering: Ember.computed.alias("controller.isHovering"),
  childViews: ["headerView", "quickIssueView", CollectionView, "collapsedView"],
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
