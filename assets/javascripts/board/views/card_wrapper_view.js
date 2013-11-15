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
        memberFilter.mode === 1 && (dimFilters = dimFilters.concat([memberFilter]))
        memberFilter.mode === 2 && (hideFilters = hideFilters.concat([memberFilter]));
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

      return "";

    }.property("App.memberFilter.mode", "App.dimFilters", "App.hideFilters", "App.searchFilter"),
    click: function(){
      var view = Em.View.views[this.$().find("> div").attr("id")];
      view.get("controller").send("fullscreen")
    }                                                                      
});

module.exports = CardWrapperView;
