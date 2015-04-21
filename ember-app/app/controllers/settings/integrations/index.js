import Ember from 'ember';
import ajax from 'ic-ajax';

var SettingsIntegrationsIndexController = Ember.ObjectController.extend({
  needs: ['settings/integrations'],
  possibleIntegrations: Ember.computed.alias('controllers.settings/integrations.possibleIntegrations'),
  disabled: function(){
    return this.get("processing") || this.get("editing.disabled");
  }.property("processing","editing.disabled"),
  actions: {
    removeWebhook: function(hook){
      this.get("model.integrations").removeObject(hook);
      var endpoint = "/api/" + this.get("controllers.application.model.full_name") + "/integrations";
      ajax({
        url: endpoint + "/" + hook.get("_id"),
        type: "DELETE",
        data: {
          rev: hook.get("_rev")
        }
      });
    }
  }
});

export default SettingsIntegrationsIndexController;
