var CardWrapperView = Em.View.extend({
    templateName: "cardItem",
    classNames: ["card"],
    classNameBindings: ["isFiltered","isDraggable:is-draggable", "isClosable:closable", "colorLabel", "content.color:border"],
    colorLabel: function () {
      return "-x" + this.get("content.color");
    }.property("content.color"),
    isClosable: function () {
     var currentState = this.get("content.current_state");

     return App.get("loggedIn") && currentState.is_last && this.get("content.state") === "open";
    }.property("App.loggedIn", "content.current_state","content.state"),
    onDestroy: function (){
      Ember.run.once(function () {
        var view = this;
        this.$().fadeOut("fast", function () {
          var parentView = view.get("parentView"),
              issues = parentView.get("content"),
              issue = issues.find(function(i) {
                return i.id === view.get("content.id");
              });

          issues.removeObject(issue);

        })
      }.bind(this))
    }.observes("content.isArchived"),
    isDraggable: function( ){
      return App.get("loggedIn") && App.get("repo.is_collaborator");
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

    }.property("App.memberFilter.mode", "App.dimFilters", "App.hideFilters", "App.searchFilter", "App.eventReceived"),
    click: function(){
      var view = Em.View.views[this.$().find("> div").attr("id")];
      view.get("controller").send("fullscreen")
    },
    dragEnter: function(ev) {
      ev.preventDefault();
      if(ev.dataTransfer.types.contains("text/huboard-assignee")){
        this.$().addClass("assignee-accept");
      }
    },
    dragOver: function(ev) {
      ev.preventDefault();
      if(ev.dataTransfer.types.contains("text/huboard-assignee")){
        this.$().addClass("assignee-accept");
      }
    },
    dragLeave: function(ev) {
      ev.preventDefault();
      if(ev.dataTransfer.types.contains("text/huboard-assignee")){
        this.$().removeClass("assignee-accept");
      }
    },
    drop: function(ev){
      if(ev.stopPropagation) {
        ev.stopPropagation();
      }

      if(ev.dataTransfer.types.contains("text/huboard-assignee")){
        var view = Em.View.views[this.$().find("> div").attr("id")];
        view.get("controller").send("assignUser", ev.dataTransfer.getData("text/huboard-assignee"));

        ev.preventDefault();
        this.$().removeClass("assignee-accept");
      }
    }
});

module.exports = CardWrapperView;
