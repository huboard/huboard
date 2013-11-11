var AssigneeController = Ember.ObjectController.extend({
  needs: ["index"],
  assigneesBinding: "controllers.index.model.assignees",
  dimFiltersBinding: "App.dimFilters",
  hideFiltersBinding: "App.hideFilters"
});

module.exports = AssigneeController;
