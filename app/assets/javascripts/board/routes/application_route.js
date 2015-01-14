var Serializable = require("../mixins/serializable");
var SocketMixin = require("../mixins/socket");
var ApplicationRoute = Ember.Route.extend({
  actions: {
    sessionErrorHandler: function(){
      this.render("login", { into: 'application', outlet: 'modal' });
    },
    loading: function(){
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
    },
    clearFilters: function(){
      this.controllerFor("filters").send("clearFilters");
      this.controllerFor("assignee").send("clearFilters");
      this.controllerFor("search").send("clearFilters");
    }
  },
  model: function () {
    return Em.Deferred.promise(function(p){
       Ember.run.once(function(){
        var repo = App.get("repo");
        p.resolve(App.Repo.create(repo.serialize()));
       })
    });
  },
  setupController: function(controller){
    this._super.apply(this, arguments);
    SocketMixin.apply(controller);
    controller.setUpSocketEvents();
    $(document).ajaxError(function(event, xhr){
      if(App.loggedIn && xhr.status == 404){
        this.send("sessionErrorHandler");
      }
    }.bind(this));
  }
})

module.exports = ApplicationRoute;
