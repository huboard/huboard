import Ember from 'ember';

var SettingsController = Ember.Controller.extend({
  storeAvailable:Ember.computed.alias("settings.available") 
});

export default SettingsController;
