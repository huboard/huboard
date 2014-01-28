var IssueRoute = Ember.Route.extend({
  controllerFor: function(name, _skipAssert) {
    return this._super("issue", _skipAssert);
  },
  afterModel: function (model) {
    return model.loadDetails();
  },
  renderTemplate: function () {
    this.render("issue",{into:'application',outlet:'modal'})
  }
});

module.exports = IssueRoute;
