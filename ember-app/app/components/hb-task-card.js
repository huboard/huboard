import Ember from "ember";
import IssueFiltersMixin from "app/mixins/issue-filters";
import MemberDragAndDropMixin from "app/mixins/member-drag-and-drop";
import IssueSocketMixin from "app/mixins/sockets/issue";
import SocketMixin from "app/mixins/socket";

var HbCardComponent = Ember.Component.extend(
  SocketMixin, IssueFiltersMixin, MemberDragAndDropMixin, IssueSocketMixin, {
    tagName: "li",
    classNames: ["card"],
    classNameBindings: ["isFiltered","isDraggable:is-draggable", "isClosable:closable", "colorLabel", "issue.color:border", "stateClass"],
    filters: Ember.inject.service(),
    colorLabel: function () {
      return "-x" + this.get("issue.color");
    }.property("issue.color"),
    isCollaborator: function(){
      return this.get("issue.repo.is_collaborator");
    }.property("issue.repo.is_collaborator"),
    isClosable: function () {
     return App.get("loggedIn") && this.get("isLast") && this.get("issue.state") === "open";
    }.property("loggedIn", "isLast","issue.state"),
    onDestroy: function (){
      if(!this.get("issue.isArchived")){ return; }
      var self = this;
      Ember.run.once(function () {
        self.$().fadeOut("fast", function () {
          var issue = self.get("issues").find(function(i) {
            return i.id === self.get("issue.id");
          });
          self.get("issues").removeObject(issue);
        });
      });
    }.observes("issue.isArchived"),
    isDraggable: function( ){
      return App.get("loggedIn") &&
        this.get("isCollaborator") &&
        this.get("isFiltered") !== "filter-hidden";
    }.property("loggedIn","issue.state", "isFiltered"),
    isFiltered: function(){
      var item = this.get("issue");
      if(this.isHidden(item)){return "filter-hidden";}
      if(this.isDim(item)){return "dim";}
      return "";
    }.property("filters.hideFilters", "filters.dimFilters", "App.eventReceived"),
    click: function(){
      if(this.get("isFiltered") === "filter-hidden"){
        return;
      }
      this.sendAction("cardClick");
    },
    issueNumber: function () {
       return this.get("issue.number");
    }.property(),
    repositoryName: function () {
       var repo = this.get("issue.repo.name"),
          login = this.get("issue.repo.owner.login");

      return login  + "/" + repo;
    }.property(),
    isLast: function(){
      return this.get("isLastColumn") && this.get("isCollaborator");
    }.property("isLastColumn", "isCollaborator"),
    canArchive: function () {
      this.get("isCollaborator");
      return this.get("issue.state") === "closed" &&
        App.get("loggedIn") && this.get("isCollaborator");
    }.property("issue.state", "isCollaborator"),
    cardLabels: function () {
        return this.get("issue.other_labels").map(function(l){
          return Ember.Object.create(_.extend(l,{customColor: "-x"+l.color}));
        });
    }.property("issue.other_labels.@each"),
    stateClass: function(){
       var github_state = this.get("issue.state");
       if(github_state === "closed"){
         return "hb-state-" + "closed";
       }
       var custom_state = this.get("issue.customState");
       if(custom_state){
         return "hb-state-" + custom_state;
       }
       return "hb-state-open";
    }.property("issue.current_state", "issue.customState", "issue.state"),

    registerToColumn: function(){
      this.set("cards", this.get("parentView.cards"));
      this.get("cards").pushObject(this);
    }.on("didInsertElement"),
    unregisterFromColumn: function(){
      this.get("cards").removeObject(this);
    }.on("willDestroyElement"),

    actions: {
      assignUser: function(login){
        return this.get("issue").assignUser(login);
      },
      archive: function () {
        this.get("issue").archive();
      },
      close: function (){
        this.get("issue").close();
      }
    },
});

export default HbCardComponent;
