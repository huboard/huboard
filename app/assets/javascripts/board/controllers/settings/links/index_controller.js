var SettingsLinksIndexController = Ember.ObjectController.extend({
  needs: ['application'],
  repoFullName: '',
  validateRepo: function(){
    console.log(this.get('repoFullName'));
  },
  observesFullName: function(){
    Ember.run.debounce(this, this.validateRepo, 400);
  }.observes('repoFullName'),
  actions: {
    submit: function(){
      var controller = this;
      this.set("isDisabled", true);
      this.get("controllers.application.model").createLink(this.get("repoFullName"))
        .then(function(){
          controller.set("isDisabled", false);
          controller.set("repoFullName","")
        });
    }
  }
});

module.exports = SettingsLinksIndexController;
