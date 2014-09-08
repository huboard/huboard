var SettingsLinksController = Ember.ArrayController.extend({
  needs: ["settings"],
  repository: Ember.computed.alias("controllers.settings.repository"),
  columns: Ember.computed.alias("controllers.settings.column_labels"),
  itemController: 'settingsLink'

});

module.exports = SettingsLinksController;
