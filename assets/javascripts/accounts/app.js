
// Create our Application
(function () {

  App = Ember.Application.create({
    rootElement : "#main-stage"
  })

  App.ApplicationController = Ember.Controller.extend();

  App.ApplicationRoute = Ember.Route.extend({
    model : function () {
      return Em.Deferred.promise(function(p) {

        $.getJSON("/api/profiles").then(function(response) {

          var user = App.User.create(response.user);

          var orgs = Em.A();

          response.orgs.forEach(function(org) {
             orgs.pushObject(App.Org.create(org));
          });

          p.resolve(Ember.Object.create({
             user : user,
             orgs : orgs
          }));


        });


      });


      return Ember.RSVP.hash($.getJSON("/api/profiles"))
    }
  });

  App.User = Ember.Object.extend({

    loadDetails : function () {
       var user = this; 
       return Em.Deferred.promise(function(p) {
          p.resolve($.getJSON("/api/profiles/user").then(function (response) {
             user.set("details", response)
             return response;
          }));
        });
    },

  })

  App.Org = Ember.Object.extend({

    loadDetails : function () {
       var org = this; 
       return Em.Deferred.promise(function(p) {
          p.resolve($.getJSON("/api/profiles/"+ org.get("login")).then(function (response) {
             org.set("details", response)
             return response;
          }));
        });
    },

  })

  App.IndexRoute = Ember.Route.extend({
    model : function () {
       var model = this.modelFor("application");
       return App.User.create(model.user);
    },

    afterModel: function (model) {
      return model.loadDetails();
    }
  })

  App.Router.map(function(){
    this.route("profile", { path: "/:profile_id" });
    //this.resource("profile")
  })
  App.ProfileRoute = Ember.Route.extend({
    model: function(params) {

      var profiles = this.modelFor("application");
      return App.Org.create(profiles.orgs.find(function(item) {
        return item.id == params.profile_id;                   
      }));

    },
    afterModel : function (model) {
      return model.loadDetails();
    }
  })

  App.AccountController = Ember.ObjectController.extend();

 


})(this);

