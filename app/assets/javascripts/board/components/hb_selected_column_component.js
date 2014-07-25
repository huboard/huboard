var HbSelectedColumnComponent = Ember.Component.extend({
  tagName: "ul",
  classNames: ["nav","breadcrumbs"],
  classNameBindings: ["isCustomState:hb-state","stateClass"],
  isCustomState: function(){
    return this.get("stateClass") !== "hb-state-open";
  }.property("stateClass"),
  isEnabled: function() {
    return App.get("repo.is_collaborator");
  }.property("App.repo.is_collaborator"),
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
  selectedColumn: function () {
    var state = this.get("issue.current_state")
    return this.get("columns").find(function(column){
      return column.name === state.name;
    });
  }.property("issue.current_state", "issue.customState", "issue.state"),
  visibleColumns: function() {
    //return this.get('columns')
    var total = this.get("columns.length"),
      index = this.get("columns").indexOf(this.get("selectedColumn")),
      last = index == (total - 1),
      first = index == 0,
      start = last ? index - 2 : first ? index : index - 1,
      end = last ? index + 1 : first ? index + 3 : (index + 2) > total - 1 ? total : index + 2;

    return this.get("columns").slice(start, end) 

  }.property("selectedColumn")
})

module.exports = HbSelectedColumnComponent;
