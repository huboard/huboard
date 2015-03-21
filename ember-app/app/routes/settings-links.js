import Ember from 'ember';

var SettingsLinksRoute = Ember.Route.extend({
  model: function(){
    // hacks!
    var appModel = this.modelFor("application");
    return appModel.fetchLinks();

  }
});

export default SettingsLinksRoute;
