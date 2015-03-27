import Ember from 'ember';
import Integration from 'app/models/integration';

var SettingsIntegrationsNewController = Ember.ObjectController.extend({
  needs: ['application', "settings/integrations"],
  disabled: function(){
    return this.get("processing") || this.get("model.disabled");
  }.property("processing","model.disabled"),
  actions: {
    submit: function(){
      var controller = this.get("controllers.settings/integrations"),
        endpoint = "/api/" + this.get("controllers.application.model.full_name") + "/integrations";

        this.set("processing", true);

        Ember.$.post(endpoint,{
          integration: {
            name: this.get("name"),
            data: Ember.merge({},this.get("attrs"))
          }
        }, "json").then(function(result) {
          controller.get("model.integrations")
            .pushObject(Integration.create(result));
          controller.transitionToRoute("settings.integrations.index");
          controller.set("processing", false);
        });
        this.get('model').clearForm();
    },
  }
});

export default SettingsIntegrationsNewController;
