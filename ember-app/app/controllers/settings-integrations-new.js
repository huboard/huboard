var SettingsIntegrationsNewController = Ember.ObjectController.extend({
  needs: ['application', "settingsIntegrations"],
  disabled: function(){
    return this.get("processing") || this.get("model.disabled");
  }.property("processing","model.disabled"),
  actions: {
    submit: function(){
      var controller = this.get("controllers.settingsIntegrations"),
        endpoint = "/api/" + this.get("controllers.application.model.full_name") + "/integrations";

        this.set("processing", true);

        Ember.$.post(endpoint,{
          integration: {
            name: this.get("name"),
            data: Ember.merge({},this.get("attrs"))
          }
        }, "json").then(function(result) {
          controller.get("model.integrations")
            .pushObject(App.Integration.create(result));
          controller.transitionToRoute("settings.integrations.index");
          controller.set("processing", false);
        });
        this.get('model').clearForm();
    },
  }
})

module.exports = SettingsIntegrationsNewController;
