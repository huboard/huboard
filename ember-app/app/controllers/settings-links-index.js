var SettingsLinksIndexController = Ember.ObjectController.extend({
  needs: ['application', 'settingsLinks'],
  repoFullName: '',
  validateRepo: function(){
    console.log(this.get('repoFullName'));
  },
  observesFullName: function(){
    Ember.run.debounce(this, this.validateRepo, 400);
  }.observes('repoFullName'),
  shouldDisplayWarning: Ember.computed.alias("controllers.settingsLinks.shouldDisplayWarning"),
  shouldDisplayError: false,
  errorMessage: '',
  actions: {
    submit: function(){
      var controller = this;
      this.set("isDisabled", true);
      this.get("controllers.application.model").createLink(this.get("repoFullName"))
        .then(function(){
          controller.set("isDisabled", false);
          controller.set("shouldDisplayError", false);
          controller.set("errorMessage", '');
          controller.set("repoFullName","")
        }, function(jqXHR){
          var response = JSON.parse(jqXHR.responseText);
          controller.set("shouldDisplayError", true);
          controller.set("errorMessage", response.message);
          controller.set("isDisabled", false);
        });
    }
  }
});

module.exports = SettingsLinksIndexController;
