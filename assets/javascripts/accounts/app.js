
// Create our Application
(function () {

  App = Ember.Application.create({
    rootElement : "#main-stage"
  })

  App.ApplicationRoute = Ember.Route.extend({
    model : function () {
      return $.getJSON("/api/profiles")
    }
  });

  App.ApplicationController = Ember.ArrayController.extend({
    lookupItemController: function(object) {
      console.log("application:controller","object", object)
      
      console.log("application:controller","itemController", Ember.get(this, 'itemController'))
      return Ember.get(this, 'itemController');
    },
  });

  App.IndexRoute = Ember.Route.extend({
    redirect : function() {
      var profiles = this.modelFor("application");
      this.transitionTo("profile", profiles.get("firstObject"))
    }
  })

  App.Router.map(function(){
    this.route("profile", { path: "/:profile_id" });
    //this.resource("profile")
  })
  App.ProfileRoute = Ember.Route.extend({
    model: function(params) {

      var profiles = this.modelFor("application");
      return profiles.find(function(item) {
        return item.id == params.profile_id;                   
      })

    }


  })

})(this);

