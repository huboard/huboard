var IssueRoute = Ember.Route.extend({

  model : function (params, transition){
    // hacks!
    transition.abort()
    this.transitionTo("index")
  },
  afterModel: function (model) {
    return model.loadDetails();
    return Ember.RSVP.Promise(function (resolve, reject){
      model.loadDetails().then(function (m){
        resolve(m);
      });
    })
  },
  setupController: function(controller, model) {
    controller.set("model", model);
  },
  renderTemplate: function () {
    this.render({into:'application',outlet:'modal'})
  }
});

module.exports = IssueRoute;
