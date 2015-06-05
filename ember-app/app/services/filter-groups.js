import Ember from 'ember';

var FilterGroups = Ember.Service.extend({
  board: Ember.inject.service("filter_groups/board"),
  milestone: Ember.inject.service("filter_groups/milestone"),
  label: Ember.inject.service("filter_groups/label"),
  user: Ember.inject.service("filter_groups/user"),

  setGroups: function(model){
    var boardFilters = this.get("board").create(model);
    this.set("boardFilters", boardFilters);

    var milestoneFilters = this.get("milestone").create(model);
    this.set("milestoneFilters", milestoneFilters);

    var labelFilters = this.get("label").create(model);
    this.set("labelFilters", labelFilters);

    var userFilters = this.get("user").create();
    this.set("userFilters", userFilters);
  }
});

export default FilterGroups;
