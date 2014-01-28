var Route = require("../issue_route");

module.exports = Route.extend({
  model : function (params, transition){
    // hacks!
    transition.abort()
    this.transitionTo("milestones")
  },
  setupController: function(controller, model) {
    controller.set("model", model);
    var repo = this.modelFor("milestones").get("allRepos").find(function (r){
      return r.full_name == model.repo.owner.login + "/" + model.repo.name;
    })
    controller.set("repository", {other_labels: repo.other_labels})
  },
  actions: {
    closeModal: function () {
        this.transitionTo("milestones")
        return true;
    }
  }
});
