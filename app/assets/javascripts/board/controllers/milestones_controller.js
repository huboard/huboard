module.exports = MilestonesController = Ember.ObjectController.extend({
  needs: ["application", "filters", "assignee", "search"],
  filtersActive: function(){
    return  this.get("controllers.filters.filtersActive") ||
            this.get("controllers.search.filtersActive") ||
            this.get("controllers.assignee.filtersActive");

  }.property("controllers.filters.filtersActive", "controllers.assignee.filtersActive", "controllers.search.filtersActive"),
  isSidebarOpen: Ember.computed.alias("controllers.application.isSidebarOpen"),
  left_column: function () {
    return this.get("noMilestoneColumn");
  }.property(),
  milestone_columns: function () {
    return this.get("milestoneColumns")
  }.property("milestoneColumns.length"),
  forceRedraw: 0,
  milestoneMoved: function(milestoneController, index){
    
    var milestone = milestoneController.get("model.milestone"),
      owner = milestone.repo.owner.login,
      name = milestone.repo.name;

    milestoneController.set("model.milestone._data.order", index);

    $.ajax({
      url: "/api/" + owner + "/" + name + "/reordermilestone",
      type: "POST",
      data: {
        number: milestone.number,
        index: index
      },
      success: function(response){
        //milestoneController.set("model.milestone._data", response._data);
      }
    })
  }
});
