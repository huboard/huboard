import Ember from 'ember';

var SettingsIntegrationsRoute = Ember.Route.extend({
  model : function (params, transition){
    // hacks!
    var appModel = this.modelFor("application");
    return appModel.fetchIntegrations();
  }
});

export default SettingsIntegrationsRoute;
