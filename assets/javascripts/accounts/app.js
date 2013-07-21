
// Create our Application
(function () {

  App = Ember.Application.create({
    rootElement : "#main-stage"
  })

  App.ApplicationRoute = Ember.Route.extend({
    model : function () {
      return Ember.RSVP.hash($.getJSON("/api/profiles"))
    }
  });


  App.IndexRoute = Ember.Route.extend({
    model : function () {
       var model = this.modelFor("application");
       return model.user;
    }
    //redirect : function() {
    //  var profiles = this.modelFor("application");
    //  this.transitionTo("profile", profiles.orgs.get("firstObject"))
    //}
  })

  App.Router.map(function(){
    this.route("profile", { path: "/:profile_id" });
    //this.resource("profile")
  })
  App.ProfileRoute = Ember.Route.extend({
    model: function(params) {

      var profiles = this.modelFor("application");
      return profiles.orgs.find(function(item) {
        return item.id == params.profile_id;                   
      })

    }


  })

})(this);

