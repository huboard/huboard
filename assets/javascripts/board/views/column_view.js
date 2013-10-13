var ColumnView = Ember.CollectionView.extend({
  tagName:"ul",
  classNames: ["sortable"],
  content: Ember.computed.alias("controller.issues"),
  itemViewClass: Em.View.extend({
    templateName: "cardItem"
  })
})

module.exports = ColumnView;
