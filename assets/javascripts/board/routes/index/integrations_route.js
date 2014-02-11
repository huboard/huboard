
var IntegrationsRoute = Ember.Route.extend({
  model : function (params, transition){
    // hacks!
    var appModel = this.modelFor("application");
    return appModel.fetchIntegrations();
  },
  controllerFor: function(name, assert){
    return this._super("integrations.integrations", assert);
  },
  renderTemplate: function () {
    this.render("integrations.integrations",{into:'application',outlet:'modal'})
  },
  actions: {
    closeModal: function () {
        this.transitionTo("index")
        return true;
    }
  }
});

module.exports = IntegrationsRoute;
