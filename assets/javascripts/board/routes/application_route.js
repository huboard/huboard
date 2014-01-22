var Serializable = require("../mixins/serializable");
var ApplicationRoute = Ember.Route.extend({
  actions: {
    loading: function(){
      debugger;
      if(this.router._activeViews.application){
        this.render("loading",{ "into" : "application", "outlet" : "loading"});
        this.router.one('didTransition', function() {
          this.render("empty",{ "into" : "application", "outlet" : "loading"});
        }.bind(this));
        return true;
      }
      this.render("loading");
    },
    toggleSidebar: function(){
      this.controllerFor("application").toggleProperty("isSidebarOpen");
    },
    openModal: function (view){
      this.render(view, {
        into: "application",
        outlet: "modal"
      })
    },
    closeModal: function() {
      App.animateModalClose().then(function() {
        this.render('empty', {
          into: 'application',
          outlet: 'modal'
        });
      }.bind(this));
    }
  },
  model: function () {
    return Em.Deferred.promise(function(p){
       Ember.run.once(function(){
        var repo = App.get("repo");
        p.resolve(App.Repo.create(repo.serialize()));
       })
    });
  }

})

module.exports = ApplicationRoute;
