var ApplicationRoute = Ember.Route.extend({
  model: function () {
    return Em.Deferred.promise(function(p){
       Ember.run.once(function(){
        p.resolve(App.Repo.create(App.get("repo")));
       })
    });
  }

})

module.exports = ApplicationRoute;
