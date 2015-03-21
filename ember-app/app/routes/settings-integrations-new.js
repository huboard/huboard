var SettingsIntegrationsNewRoute = Ember.Route.extend({
  model: function(params, transition){
    return this.controllerFor('settingsIntegrations')
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

module.exports = SettingsIntegrationsNewRoute;
