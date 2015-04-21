import Ember from 'ember';

var SettingsIntegrationsRoute = Ember.Route.extend({
  model : function (){
    // hacks!
    var appModel = this.modelFor("application");
    return appModel.fetchIntegrations();
  }
});

export default SettingsIntegrationsRoute;
