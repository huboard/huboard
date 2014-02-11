var IntegrationsController = Ember.ObjectController.extend({
  needs: ['application'],
  isValid: function () {
    return this.get("model.webhookUrl");
  }.property("model.webhookUrl"),
  disabled: function () {
      return this.get("processing") || !this.get("isValid");
  }.property("processing","isValid"),
  actions: {
    submit: function(){
      var controller = this,
        endpoint = "/api/" + this.get("controllers.application.model.full_name") + "/integrations";

        Ember.$.post(endpoint,{
          integration: {
            webhook_url: controller.get("model.webhookUrl")
          }
        }, "json").then(function(result) {
          controller.get("model.integrations")
            .pushObject(App.Integration.create(result));
        });

      
      controller.set("model.webhookUrl", "")
    },
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
