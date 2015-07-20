import Ember from 'ember';

var SettingsLinksController = Ember.Controller.extend({
  needs: ["settings"],
  repository: Ember.computed.alias("controllers.settings.model.repository"),
  columns: Ember.computed.alias("controllers.settings.model.column_labels"),
  shouldDisplayWarning: function(){
    return this.get("content.length") > 5;
  }.property('content.length')
});

export default SettingsLinksController;
