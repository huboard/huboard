var Serializable = require("../mixins/serializable");
var ApplicationRoute = Ember.Route.extend({
  actions: {
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
