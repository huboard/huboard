var CollectionView = Ember.CollectionView.extend({
  tagName:"ul",
  classNames: ["sortable"],
  attributeBindings: ["style"],
  style: Ember.computed.alias("controller.style"),
  content: Ember.computed.alias("controller.issues"),
  didInsertElement: function(){
    var that = this;
    this.$().sortable({
      tolerance: 'pointer',
      connectWith:".sortable",
      placeholder: "ui-sortable-placeholder",
      items: "li.is-draggable",
      receive: function(ev, ui) {
        that.get("controller").cardReceived(ui);
      },
      activate: function () {
        that.get("controller").set("isHovering", true);
      },
      deactivate: function() {
        that.get("controller").set("isHovering", false);
      }
    })
    this._super();
  },
  itemViewClass: App.CardWrapperView 
})

var ColumnView = Ember.ContainerView.extend({
  classNameBindings:[":column","isCollapsed:hb-state-collapsed","isHovering:hovering"],
  isCollapsed: Ember.computed.alias("controller.isCollapsed"),
  isHovering: Ember.computed.alias("controller.isHovering"),
  childViews: ["headerView", CollectionView, "collapsedView"],
  headerView: Ember.View.extend({
    tagName: "h3",
    templateName: "columnHeader",
    click: function(){
      this.get("controller").toggleProperty('isCollapsed')
    }
  }),
  collapsedView: Ember.View.extend({
    classNames:["collapsed"],
    click: function(){
      this.get("controller").toggleProperty('isCollapsed')
    },
    didInsertElement: function(){
      var that = this;
      this.$().droppable({
        out: function() {
         // that.get("controller").set("isHovering",false);
        },
        over: function () {
         // that.get("controller").set("isHovering",true);
        }
      })
      this._super();
    }
  }),

});

module.exports = ColumnView;
