var ColumnView = Ember.CollectionView.extend({
  tagName:"ul",
  classNames: ["sortable"],
  content: Ember.computed.alias("controller.issues"),
  itemViewClass: Em.View.extend({
    templateName: "cardItem",
    classNameBindings: ["isFiltered"],
    isFiltered: function() {
      var dimFilters = App.get("dimFilters"),
          hideFilters = App.get("hideFilters"),
          that = this;

      if(dimFilters.any(function(f){
        return !f.condition(that.get("content"));
      })){
        return "dim";
      }

      if(hideFilters.any(function(f){
        return !f.condition(that.get("content"));
      })){
        return "hide";
      }
    }.property("App.dimFilters", "App.hideFilters")
  })
})

module.exports = ColumnView;
