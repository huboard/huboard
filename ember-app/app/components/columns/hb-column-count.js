import Ember from "ember";
import IssueFiltersMixin from "app/mixins/issue-filters";

var HbColumnCountComponent = Ember.Component.extend(IssueFiltersMixin, {
  tagName: "span",
  filters: Ember.inject.service(),
  showColumnCounts: Ember.computed.alias("settings.showColumnCounts"),
  classNameBindings: ["isOverWip:hb-state-error"],
  issues: [],
  issuesCount: function(){
    return this.get("issues.length");
  }.property("issues"),
  isFiltered: function(){
    return this.get("filters.hideFilters.length");
  }.property("filters.hideFilters"),
  filteredCount: function() {
    var self = this;
    var issues = this.get("issues"),
    filteredCount = 0;

    issues.forEach(function(issue){
      if(self.isHidden(issue)){ filteredCount++; }
    });

    return issues.length - filteredCount;
  }.property("issues","filters.hideFilters"),
  isOverWip: function(){
    var wip = this.get("column.wip");
    return wip && this.get("issuesCount") > wip;
  }.property("issuesCount")
});

export default HbColumnCountComponent;
