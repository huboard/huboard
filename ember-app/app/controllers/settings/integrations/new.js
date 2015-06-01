import Ember from 'ember';
import Integration from 'app/models/integration';

var SettingsIntegrationsNewController = Ember.Controller.extend({
  needs: ['application', "settings/integrations"],
  disabled: function(){
    return this.get("processing") || this.get("model.disabled");
  }.property("processing","model.disabled"),
  actions: {
    submit: function(){
      var self = this;
      var controller = this.get("controllers.settings/integrations"),
        endpoint = "/api/" + this.get("controllers.application.model.full_name") + "/integrations";

        this.set("processing", true);

        Ember.$.post(endpoint,{
          integration: {
            name: this.get("model.name"),
            data: Ember.merge({},this.get("model.attrs"))
          }
        }, "json").then(function(result) {
          self.set("processing", false);
          controller.set("processing", false);
          self.get('model').clearForm();

          controller.get("model.integrations")
            .pushObject(Integration.create(result));
          controller.transitionToRoute("settings.integrations.index");
        });
    },
  }
});

export default SettingsIntegrationsNewController;
