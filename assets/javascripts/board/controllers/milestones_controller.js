module.exports = MilestonesController = Ember.ObjectController.extend({

  needs: ['application'],
  isSidebarOpen: Ember.computed.alias("controllers.application.isSidebarOpen"),
  left_column: function () {
    return Ember.Object.create({
      title: "No milestone",
      filterBy: function(i) {
        return !Ember.get(i, "milestone");
      },
      cssClass: "no-milestone"
    });
  }.property(),
  milestone_columns: function () {
    return this.get("milestones").map(function(m){
      return Ember.Object.create({
        title: m.title,
        filterBy: function (i){
          return i.milestone && i.milestone.number == m.number;
        },
        milestone: m
      });
    });

  }.property(),
  forceRedraw: 0
});
