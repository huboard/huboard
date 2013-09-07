
// Create our Application
(function () {

  App = Ember.Application.create({
    rootElement : "#main-application"
  })

  App.ApplicationController = Ember.Controller.extend();

  App.ApplicationRoute = Ember.Route.extend({
    actions: {
      openModal: function (view){
        this.render(view, {
          into: "application",
          outlet: "modal"
        })
      }
    },
    
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
    }
  });

  App.User = Ember.Object.extend({

    gravatar_url : function() {
      return this.get("avatar_url") + "&s=24&d=retro"

    }.property("avatar_url"),

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

    gravatar_url : function() {
      return this.get("avatar_url") + "&s=24&d=retro"

    }.property("avatar_url"),

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
       return model.user;
    },

    afterModel: function (model) {
      return model.loadDetails();
    }
  })

  App.Router.map(function(){
    this.resource("profile", { path: "/:profile_id" });
    //this.resource("profile")
  })
  App.ProfileRoute = Ember.Route.extend({
    model: function(params) {

      var profiles = this.modelFor("application");
      return profiles.orgs.find(function(item) {
        return item.id == params.profile_id;                   
      });

    },
    afterModel : function (model) {
      return model.loadDetails();
    }
  })

  App.AccountController = Ember.ObjectController.extend({
    needs: ["purchaseForm"],  
    actions: {
      purchase: function (model) {
        this.set("controllers.purchaseForm.model", model)
        this.send("openModal","purchaseForm")
      }
    }  
  });

 App.XTabsComponent = Ember.Component.extend({
  init: function() {
    this._super.apply(this, arguments);
    this.panes = [];
  },
  
  addPane: function(pane) {
    if (this.get('panes.length') == 0) this.select(pane);
    this.panes.pushObject(pane);
  },
  
  select: function(pane) {
    this.set('selected', pane);
  }

});

App.XPaneComponent = Ember.Component.extend({
  didInsertElement: function() {
    this.get('parentView').addPane(this);
  },
  
  selected: function() {
    return this.get('parentView.selected') === this;
  }.property('parentView.selected')
});

App.animateModalClose = function() {
  var promise = new Ember.RSVP.defer();

  $('.modal.in').removeClass('in');
  $('.modal-backdrop.in').removeClass('in');

  setTimeout(function() {
    promise.resolve();
  }, 250);

  return promise.promise;
};

App.animateModalOpen = function() {
  var promise = new Ember.RSVP.defer();

  $('.modal').addClass('in');
  $('.modal-backdrop').addClass('in');

  setTimeout(function() {
    promise.resolve();
  }, 250);

  return promise.promise;
};

})(this);

