module.exports = MilestonesController = Ember.ObjectController.extend({

  needs: ['application'],
  isSidebarOpen: Ember.computed.alias("controllers.application.isSidebarOpen"),
  milestone_columns: function () {
    return [];
  }
});
