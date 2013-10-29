var DrawerController = Ember.ObjectController.extend({
  needs: ["index"],
  backlogColumn: Ember.computed.alias("controllers.index.columns.firstObject")

});

module.exports = DrawerController;
