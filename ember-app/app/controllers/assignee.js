import Ember from 'ember';

var AssigneeController = Ember.Controller.extend({
  filters: Ember.inject.service(),
  avatarsBinding: "filters.filterGroups.member.avatars",
  memberFiltersBinding: "filters.filterGroups.member.filters",

  noActiveMembers: function(){
    return this.get("avatars").length === 0;
  }.property("avatars"),
});

export default AssigneeController;
