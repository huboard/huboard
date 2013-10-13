var IndexRoute = Ember.Route.extend({
  model: function(){
    var repo = this.modelFor("application");

    return Ember.$.getJSON("/api/" + repo.get("full_name") + "/board");

  }

});

module.exports = IndexRoute;
