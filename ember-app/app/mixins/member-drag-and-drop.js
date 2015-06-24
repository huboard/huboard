import Ember from 'ember';

var IssueDragAndDropMixin = Ember.Mixin.create({
  dragAuthorized: function(ev){
    var contains_type = ev.dataTransfer.types.contains("text/huboard-assignee");
    return contains_type  && this.isAssignable();
  },
  isAssignable: function(){
    var self = this;
    var login = Ember.$("#application").find(".assignees .is-flying")
      .data("assignee");
    var repo = _.find(this.get("repos"), function(r){
      return r.full_name === self.get("issue.repo.full_name");
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

export default IssueDragAndDropMixin;
