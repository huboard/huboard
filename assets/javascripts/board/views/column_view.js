var CollectionView = Ember.CollectionView.extend({
  tagName:"ul",
  classNames: ["sortable"],
  attributeBindings: ["style"],
  style: Ember.computed.alias("controller.style"),
  content: Ember.computed.alias("controller.issues"),
  didInsertElement: function(){
    var that = this;
    this.$().sortable({
      connectWith:".sortable",
      placeholder: "ui-sortable-placeholder",
      items: "li.is-draggable",
      receive: function(ev, ui) {
        that.get("controller").cardReceived(ui);
      }
    })
    this._super();
  },
  itemViewClass: App.CardWrapperView
})

var ColumnView = Ember.ContainerView.extend({
  classNames:["column","isCollapsed:hb-state-collapsed"],
  isCollapsed: false,
  childViews: ["headerView", CollectionView],
  headerView: Ember.View.extend({
    tagName: "h3",
    templateName: "columnHeader"
  })

});

module.exports = ColumnView;
