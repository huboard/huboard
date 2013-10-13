var ColumnController = Ember.ObjectController.extend({
  needs: ["index"],
  style: Ember.computed.alias("controllers.index.column_style")
})

module.exports = ColumnController;
