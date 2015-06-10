import Ember from 'ember';

var CardWrapperView = Ember.View.extend({
    templateName: "cardItem",
    classNames: ["card"],
    classNameBindings: ["isFiltered","isDraggable:is-draggable", "isClosable:closable", "colorLabel", "content.color:border"],
    colorLabel: function () {
      return "-x" + this.get("content.color");
    }.property("content.color"),
    combinedRepos: Ember.computed.alias("controller.parentController.model.combinedRepos"),
    isCollaborator: function(){
      return this.get("content.repo.is_collaborator");
    }.property("content.repo.is_collaborator"),
    isClosable: function () {
     var currentState = this.get("content.current_state");

     return App.get("loggedIn") && currentState.is_last && this.get("content.state") === "open";
    }.property("loggedIn", "content.current_state","content.state"),
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

        });
      }.bind(this));
    }.observes("content.isArchived"),
    isDraggable: function( ){
      return App.get("loggedIn") 
        && this.get("isCollaborator")
        && this.get('isFiltered') !== 'filter-hidden';
    }.property("loggedIn","content.state", 'isFiltered'),
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
        if(memberFilter.mode === 1) {
           (dimFilters = dimFilters.concat([memberFilter]));
        }
        if(memberFilter.mode === 2) {
          (hideFilters = hideFilters.concat([memberFilter]));
        }
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
      if(this.get('isFiltered') === 'filter-hidden'){
        return;
      }
      var view = Ember.View.views[this.$().find("> div").attr("id")];
      view.get("controller").send("fullscreen");
    },
    dragAuthorized: function(ev){
      var contains_type = ev.dataTransfer.types.contains("text/huboard-assignee");
      return contains_type && this.isAssignable() && this.get("isCollaborator");
    },
    isAssignable: function(){
      var self = this;
      var login = $("#application").find(".assignees .is-flying")
        .data("assignee");
      var repo = _.find(this.get("combinedRepos"), function(r){
        return r.full_name === self.get("content.repo.full_name");
      });
      if(repo === null){ return false; }
      return repo.get("assignees").any(function(assignee){
        return assignee.login === login;
      });
    },
    dragEnter: function(ev) {
      ev.preventDefault();
      if(this.dragAuthorized(ev)){
        this.$().addClass("assignee-accept");
      } else {
        this.$().addClass("assignee-error");
      }
    },
    dragOver: function(ev) {
      ev.preventDefault();
      if(this.dragAuthorized(ev)){
        this.$().addClass("assignee-accept");
      } else {
        this.$().addClass("assignee-error");
      }
    },
    dragLeave: function(ev) {
      ev.preventDefault();
      if(this.dragAuthorized(ev)){
        this.$().removeClass("assignee-accept");
      } else {
        this.$().removeClass("assignee-error");
      }
    },
    drop: function(ev){
      if(ev.stopPropagation) {
        ev.stopPropagation();
      }

      if(this.dragAuthorized(ev)){
        var view = Ember.View.views[this.$().find("> div").attr("id")];
        view.get("controller").send("assignUser", ev.dataTransfer.getData("text/huboard-assignee"));
        this.$().removeClass("assignee-accept");
      } else {
        this.$().removeClass("assignee-error");
      }
      
      ev.preventDefault();
    }
});

export default CardWrapperView;
