import Ember from 'ember';
import IssueFiltersMixin from 'app/mixins/issue-filters';

var ColumnCountController = Ember.Controller.extend(IssueFiltersMixin, {
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
    return this.get('filters.hideFilters.length');
  }.property("filters.hideFilters"),
  filters: Ember.inject.service(),
  filteredCount: function() {
    var self = this;
    var issues = this.get('combinedIssues'),
    filteredCount = 0;

    issues.forEach(function(issue){
      if(self.isHidden(issue)){ filteredCount++; }
    });

    return issues.length - filteredCount;
  }.property("combinedIssues","filters.hideFilters"),
  isOverWip: function(){
    var wip = this.get('model.wip');
    return wip && this.get("issuesCount") > wip;
  }.property("issuesCount")
});

export default ColumnCountController;
