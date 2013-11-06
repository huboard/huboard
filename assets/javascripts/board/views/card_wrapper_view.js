var CardWrapperView = Em.View.extend({
    templateName: "cardItem",
    classNameBindings: ["isFiltered","isDraggable:is-draggable"],
    isDraggable: function( ){
      return App.get("loggedIn") && this.get("content.state") !== "closed";
    }.property("App.loggedIn","content.state"),
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
});

module.exports = CardWrapperView;
