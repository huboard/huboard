var Route = require("../issue_route");

module.exports = Route.extend({
  model : function (params, transition){
    // hacks!
    var issue = this.modelFor("application")
                  .get("board.issues")
                  .findBy('id', parseInt(params.issue_id));
    if(issue) { return issue; }

    transition.abort()
    this.transitionTo("milestones")
  },
  actions: {
    closeModal: function () {
      this.transitionTo("milestones")
      return true;
    }
  }
});
