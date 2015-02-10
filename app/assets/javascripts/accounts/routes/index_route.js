IndexRoute = Ember.Route.extend({
  model : function () {
    var model = this.modelFor("application");
    return model.user;
  },

  afterModel: function (model) {
    return model.loadDetails().then(function(){
      return model.loadHistory();
    });
  }
});

module.exports = IndexRoute;
