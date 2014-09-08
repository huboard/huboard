var SettingsLinkController = Ember.ObjectController.extend({
  needs: ["settings"],
  isLinked: function(){
    return this.get("controllers.settings.column_labels.length") === this.get("columns.length")

  }.property("controllers.settings.column_labels.@each","column_labels.@each")


});

module.exports = SettingsLinkController;

