var IssueRoute = Ember.Route.extend({
  model : function (params, transition){
    // hacks!
    transition.abort()
    this.transitionTo("index")
  },
  afterModel: function (model) {
    return model.loadDetails();
  },
  setupController: function(controller, model) {
    controller.set("model", model);
    var repo = this.modelFor("index").get("allRepos").find(function (r){
      return r.full_name == model.repo.owner.login + "/" + model.repo.name;
    })
    controller.set("repository", {other_labels: repo.other_labels})
  },
  renderTemplate: function () {
    this.render({into:'application',outlet:'modal'})
  }
});

module.exports = IssueRoute;
