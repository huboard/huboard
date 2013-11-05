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
      receive: function(ev, ui) {
        that.controller.cardReceived(ui);
      }
    })
    this._super();
  },
  itemViewClass: Em.View.extend({
    templateName: "cardItem",
    classNameBindings: ["isFiltered"],
    isFiltered: function() {
      var dimFilters = App.get("dimFilters"),
          hideFilters = App.get("hideFilters"),
          searchFilter = App.get("searchFilter"),
          that = this;

      if(searchFilter) {
         hideFilters = hideFilters.concat([searchFilter]);
      }

      if(dimFilters.any(function(f){
        return !f.condition(that.get("content"));
      })){
        return "dim";
      }

      if(hideFilters.any(function(f){
        return !f.condition(that.get("content"));
      })){
        return "filter-hidden";
      }
    }.property("App.dimFilters", "App.hideFilters", "App.searchFilter")
  })
})

module.exports = ColumnView;
