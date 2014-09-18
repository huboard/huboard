var SettingsLinksController = Ember.ArrayController.extend({
  needs: ["settings"],
  repository: Ember.computed.alias("controllers.settings.repository"),
  columns: Ember.computed.alias("controllers.settings.column_labels"),
  itemController: 'settingsLink',
  shouldDisplayWarning: function(){
    return this.get("content.length") > 5;
  }.property('content.length')
});

module.exports = SettingsLinksController;
