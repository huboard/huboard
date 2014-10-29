module.exports = MilestonesController = Ember.ObjectController.extend({

  needs: ['application'],
  isSidebarOpen: Ember.computed.alias("controllers.application.isSidebarOpen"),
  left_column: function () {
    return Ember.Object.create({
      title: "No milestone",
      orderable: false,
      filterBy: function(i) {
        return !Ember.get(i, "milestone");
      },
      cssClass: "no-milestone"
    });
  }.property(),
  milestone_columns: function () {

    return _.chain(this.get("model.combinedMilestones")).map(function(groups){
      var m = _.first(groups);
      return Ember.Object.create({
        title: m.title,
        orderable: true,
        filterBy: function (i){
          return i.milestone && i.milestone.title.toLocaleLowerCase() == m.title.toLocaleLowerCase();
        },
        milestone: m,
        group: groups,
      });
    })
    .value()
    .sort(function(a, b) {
      return a.milestone._data.order - b.milestone._data.order;
    });

  }.property(),
  forceRedraw: 0,
  milestoneMoved: function(milestoneController, index){
    
    var milestone = milestoneController.get("model.milestone"),
      owner = milestone.repo.owner.login,
      name = milestone.repo.name;

    $.ajax({
      url: "/api/" + owner + "/" + name + "/reordermilestone",
      type: "POST",
      data: {
        number: milestone.number,
        index: index
      },
      success: function(response){
        milestoneController.set("model.milestone._data", response._data);
      }
    })
  }
});
