var ColumnView = Ember.CollectionView.extend({
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
        that.controller.cardReceived(ui);
      }
    })
    this._super();
  },
  itemViewClass: App.CardWrapperView
})

module.exports = ColumnView;
