var IntegrationsController = Ember.ObjectController.extend({
  needs: ['application'],
  isValid: function () {
    return this.get("model.webhookUrl");
  }.property("model.webhookUrl"),
  disabled: function () {
      return this.get("processing") || !this.get("isValid");
  }.property("processing","isValid"),
  possibleIntegrations: [
    Ember.Object.extend({
      name: "Gitter",
      attrs: {
        webhookURL: ""
      },
      disabled: function(){
        return !this.get("attrs.webhookURL")

      }.property("attrs.webhookURL")
    }).create()

  ],
  actions: {
    transitionTo: function(integration) {
      Ember.Route.prototype.render
        .call({
            router:this.container.lookup("router:main"), 
            container: this.container
          }, 
          "integrations." + integration.name.toLowerCase(), {
            into:"integrations.integrations",
            controller: this
          }
        )

      this.set("editing", integration);
    },
    cancel: function() {
      this.send("transitionTo", {name: "index"})

    },
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
