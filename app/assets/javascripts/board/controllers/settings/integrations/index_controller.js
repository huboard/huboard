var IntegrationsController = Ember.ObjectController.extend({
  needs: ['settingsIntegrations'],
  possibleIntegrations: Ember.computed.alias('controllers.settingsIntegrations.possibleIntegrations'),
  disabled: function(){
    return this.get("processing") || this.get("editing.disabled");
  }.property("processing","editing.disabled"),
  actions: {
    removeWebhook: function(hook){
      this.get("model.integrations").removeObject(hook)
      var controller = this,
        endpoint = "/api/" + this.get("controllers.application.model.full_name") + "/integrations";
      Ember.$.ajax({
        url: endpoint + "/" + hook.get("_id"),
        type: "DELETE",
        data: {
          rev: hook.get("_rev")
        }
      })
    }
  }
});

module.exports = IntegrationsController;

