var IntegrationsController = Ember.ObjectController.extend({
  needs: ['application'],
  possibleIntegrations: [
    Ember.Object.extend({
      name: "Webhook",
      attrs: {
        webhookURL: ""
      },
      disabled: function(){
        return !this.get("attrs.webhookURL")
      }.property("attrs.webhookURL")
    }).create(),
    Ember.Object.extend({
      name: "Gitter",
      attrs: {
        webhookURL: ""
      },
      disabled: function(){
        return !this.get("attrs.webhookURL")

      }.property("attrs.webhookURL")
    }).create(),

    Ember.Object.extend({
      name: "Slack",
      attrs: {
        webhookURL: "",
        channel: ""
      },
      disabled: function(){
        return !this.get("attrs.webhookURL")
      }.property("attrs.webhookURL")
    }).create(),

    Ember.Object.extend({
      name: "HipChat",
      room: "",
      authToken: "",
      attrs: function(){
        return {
          webhookURL: this.get('webhookURL'),
        }
      }.property('room', 'authToken'),
      webhookURL: function(){
        return "https://api.hipchat.com/v2/room/" + this.get('room') + "/notification?auth_token=" + this.get('authToken');
      }.property('room', 'authToken'),
      disabled: function(){
        return !this.get("attrs.webhookURL")
      }.property("attrs.webhookURL")
    }).create()

  ],
  disabled: function(){
    return this.get("processing") || this.get("editing.disabled");
  }.property("processing","editing.disabled"),
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

        this.set("processing", true);

        Ember.$.post(endpoint,{
          integration: {
            name: this.get("editing.name"),
            data: Ember.merge({},this.get("editing.attrs"))
          }
        }, "json").then(function(result) {
          controller.get("model.integrations")
            .pushObject(App.Integration.create(result));
          controller.send("transitionTo", {name: "index"})
          controller.set("processing", false);
        });
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
