ProfileRoute = Ember.Route.extend({
  model: function(params) {

    var profiles = this.modelFor("application");
    return profiles.orgs.find(function(item) {
      return item.login == params.profile_id;                   
    });

  },
  serialize: function (model) {
    return { profile_id: model.get("login")}
  },

  afterModel : function (model) {
    return model.loadDetails().then(function(){
      return model.loadHistory();
    });
  }
});

module.exports = ProfileRoute;
