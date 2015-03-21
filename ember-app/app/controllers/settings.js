var SettingsController = Ember.Controller.extend({
  storeAvailable:Ember.computed.alias("settings.available") 
})
module.exports = SettingsController;
