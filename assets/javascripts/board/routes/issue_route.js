var IssueRoute = Ember.Route.extend({
  model : function (params){
     debugger;
  },
  renderTemplate: function () {
    this.render({into:'application',outlet:'modal'})
  }
});

module.exports = IssueRoute;
