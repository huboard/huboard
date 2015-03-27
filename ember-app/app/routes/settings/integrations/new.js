import Ember from 'ember';

var SettingsIntegrationsNewRoute = Ember.Route.extend({
  model: function(params){
    return this.controllerFor('settings/integrations')
      .get("possibleIntegrations").findBy("name", params.name);
  }, 
  renderTemplate: function(controller, model){
    this.render('settings/integrations/'+ model.get("name").toLowerCase());
  },
  actions: {
    cancel: function(){
      this.transitionTo("settings.integrations.index");
    }
  }

});

export default SettingsIntegrationsNewRoute;
