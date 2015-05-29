import Ember from 'ember';

var SettingsLinksController = Ember.ArrayController.extend({
  needs: ["settings"],
  repository: Ember.computed.alias("controllers.settings.model.repository"),
  columns: Ember.computed.alias("controllers.settings.model.column_labels"),
  itemController: 'settings.link',
  shouldDisplayWarning: function(){
    return this.get("content.length") > 5;
  }.property('content.length')
});

export default SettingsLinksController;
