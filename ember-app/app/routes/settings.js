var SettingsRoute = Ember.Route.extend({
  model: function(){
    // hacks!
    var appModel = this.modelFor("application");
    return appModel.fetchSettings();

  }
});

module.exports = SettingsRoute;

