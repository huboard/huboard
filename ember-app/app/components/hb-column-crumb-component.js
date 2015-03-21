var HbColumnCrumbComponent = Ember.Component.extend({
  tagName: "li",
  classNames: ['crumb'],
  classNameBindings: ["stateClass", "isSelected:active:inactive", "indexClass"],
  isSelected: function(){
    return this.get("issue.current_state.name") === this.get("column.name");
  }.property("issue.current_state"),
  indexClass: function(){
    var index = this.get('visibleColumns').indexOf(this.get('column'));

    if(index === 0) {
      return "crumb--first";
    } else if(index === this.get('visibleColumns.length') - 1) {
      return "crumb--last";
    } else {
      return "crumb--middle";
    }

  }.property('visibleColumns', 'issue.current_state'),
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
  }.property("issue.current_state", "issue.customState", "issue.state")

})

module.exports = HbColumnCrumbComponent;

