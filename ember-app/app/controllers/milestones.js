import Ember from 'ember';

var MilestonesController = Ember.Controller.extend({
  needs: ["application", "filters", "assignee", "search"],
  isCollaborator: function(){
    return this.get("controllers.application.model.is_collaborator");
  }.property("controllers.application.model.is_collaborator"),

  filtersActive: function() {
    return this.get("controllers.filters.filtersActive") || this.get("controllers.search.filtersActive") || this.get("controllers.assignee.filtersActive");
  }.property(
    "controllers.filters.filtersActive",
    "controllers.assignee.filtersActive",
    "controllers.search.filtersActive"
  ),

  isSidebarOpen: Ember.computed.alias("controllers.application.isSidebarOpen"),

  left_column: function() {
    return Ember.Object.create({
      title: "No milestone",
      noMilestone: true,
      orderable: false,

      filterBy: function(i) {
        return !Ember.get(i, "milestone");
      },

      cssClass: "no-milestone"
    });
  }.property(),

  milestone_columns: function() {
    return _.chain(this.get("model.combinedMilestones")).map(function(groups) {
      var m = _.first(groups);

      return Ember.Object.create({
        title: m.title,
        orderable: true,

        filterBy: function(i) {
          return i.milestone && i.milestone.title.toLocaleLowerCase() === m.title.toLocaleLowerCase();
        },

        milestone: m,
        group: groups
      });
    }).value().sort(function(a, b) {
      return a.milestone._data.order - b.milestone._data.order;
    });
  }.property("forceRedraw"),

  forceRedraw: 0,

  milestoneMoved: function(milestoneController, index) {
    var milestone = milestoneController.get("model.milestone"), owner = milestone.repo.owner.login, name = milestone.repo.name;

    Ember.$.ajax({
      url: "/api/" + owner + "/" + name + "/reordermilestone",
      type: "POST",

      data: {
        number: milestone.number,
        index: index
      },

      success: function(response) {
        milestoneController.set("model.milestone.description", response.description);
        milestoneController.set("model.milestone._data", response._data);
      }
    });
  }
});

export default MilestonesController;
