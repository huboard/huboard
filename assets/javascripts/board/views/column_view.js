var ColumnView = Ember.CollectionView.extend({
  tagName:"ul",
  classNames: ["sortable"],
  content: Ember.computed.alias("controller.issues"),
  itemViewClass: Em.View.extend({
    templateName: "cardItem",
    classNameBindings: ["isFiltered"],
    isFiltered: function() {
      var filters = App.get("dimFilters"),
          that = this;
      if(filters.any(function(f){
        return !f.condition(that.get("content"));
      })){
        
        return "dim";
      }
    }.property("App.dimFilters")
  })
})

module.exports = ColumnView;
