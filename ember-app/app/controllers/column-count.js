import Ember from 'ember';

var ColumnCountController = Ember.ObjectController.extend({
  needs: ["index"],
  combinedIssues: function(){
    var index = this.get("model.index");
    var issues = this.get("controllers.index.model.combinedIssues").filter(function(i){
      return i.current_state.index === index;

    });
    return issues;
  }.property("controllers.index.model.combinedIssues.@each.current_state"),
  issuesCount: function(){
    return this.get('combinedIssues.length');
  }.property("combinedIssues"),
  isFiltered: function(){
    return this.get('hideFilters.length');
  }.property("hideFilters"),
  hideFilters: function(){
    var hideFilters = App.get("hideFilters"),
    searchFilter = App.get("searchFilter"),
    memberFilter = App.get("memberFilter");

    if(searchFilter) {
      hideFilters = hideFilters.concat([searchFilter]);
    }

    if(memberFilter) {
      if(memberFilter.mode === 2) {
        (hideFilters = hideFilters.concat([memberFilter]));
      }
    }

    return hideFilters;
  }.property("App.memberFilter.mode", "App.dimFilters", "App.hideFilters", "App.searchFilter", "App.eventReceived"),
  filteredCount: function() {
    var hideFilters = this.get("hideFilters"),
    issues = this.get('combinedIssues'),
    that = this;

    var filteredCount = 0;

    issues.forEach(function(issue){
      if(hideFilters.any(function(f){
        return !f.condition(issue);
      })){
        filteredCount++;
      }
    });
    return issues.length - filteredCount;
  }.property("combinedIssues","hideFilters"),
  isOverWip: function(){
    var wip = this.get('model.wip');
    return wip && this.get("issuesCount") > wip;
  }.property("issuesCount")
});

export default ColumnCountController;
