var IssueSelectedColumnView = Ember.CollectionView.extend({
  tagName: "ul",
  classNames: ["nav","breadcrumbs"],
  classNameBindings: ["stateClass", "isEnabled:enabled:disabled"],
  isEnabled: function() {
    return App.get("repo.is_collaborator");
  }.property("App.repo.is_collaborator"),
  stateClass: function(){
    var github_state = this.get("controller.model.state");
    if(github_state === "closed"){
      return "hb-state-" + "closed";
    }
    var custom_state = this.get("controller.model.customState");
    if(custom_state){
      return "hb-state-" + custom_state;
    }
    return "hb-state-open";
  }.property("controller.model.current_state", "controller.model.customState", "controller.model.state"),
  itemViewClass: Ember.View.extend({
    tagName: "li",
    templateName: "issue/selected_column",
    classNameBindings: ["isSelected:active", "stateClass"],
    isSelected: function(){
      return this.get("controller.model.current_state.name") === this.get("content.name");
    }.property("controller.model.current_state")
  })

});

module.exports = IssueSelectedColumnView;
