var CardWrapperView = Em.View.extend({
    templateName: "cardItem",
    classNameBindings: ["isFiltered","isDraggable:is-draggable"],
    isDraggable: function( ){
      return App.get("loggedIn");
    }.property("App.loggedIn","content.state"),
    isFiltered: function() {
      var dimFilters = App.get("dimFilters"),
          hideFilters = App.get("hideFilters"),
          searchFilter = App.get("searchFilter"),
          memberFilter = App.get("memberFilter"),
          that = this;

      if(searchFilter) {
         hideFilters = hideFilters.concat([searchFilter]);
      }

      if(memberFilter) {
        memberFilter.mode === 1 ? dimFilters.concat([memberFilter]) 
                                : hideFilters.concat([memberFilter]);
      }

      if(hideFilters.any(function(f){
        return !f.condition(that.get("content"));
      })){
        return "filter-hidden";
      }

      if(dimFilters.any(function(f){
        return !f.condition(that.get("content"));
      })){
        return "dim";
      }

    }.property("App.memberFilter", "App.dimFilters", "App.hideFilters", "App.searchFilter")
});

module.exports = CardWrapperView;
