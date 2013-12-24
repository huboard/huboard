
// Create our Application
(function () {
  Handlebars.registerHelper("stripe-money", function(path) {
    var value = Ember.getPath(this, path);
    return "$" + parseFloat(value/100).toFixed(0);
  });
  
  App = Ember.Application.create({
    rootElement : "#main-application"
  })

  App.ApplicationController = Ember.Controller.extend();

  App.LoadingRoute = Ember.Route.extend({
    renderTemplate: function() {
      if(this.router._activeViews.application){
        return this.render({ "into" : "application", "outlet" : "loading"});
      }
      this.render("loading");
    }
  });

  App.LoadingView = Ember.View.extend({
    didInsertElement: function(){
       $("body").addClass("fullscreen-open")
       var opts = {
         lines: 13, // The number of lines to draw
         length: 0, // The length of each line
         width: 6, // The line thickness
         radius: 14, // The radius of the inner circle
         corners: 1, // Corner roundness (0..1)
         rotate: 19, // The rotation offset
         direction: 1, // 1: clockwise, -1: counterclockwise
         color: '#4a3e93', // #rgb or #rrggbb or array of colors
         speed: 0.3, // Rounds per second
         trail: 42, // Afterglow percentage
         shadow: false, // Whether to render a shadow
         hwaccel: true, // Whether to use hardware acceleration
         className: 'spinner', // The CSS class to assign to the spinner
         zIndex: 2e9, // The z-index (defaults to 2000000000)
         top: 'auto', // Top position relative to parent in px
         left: 'auto' // Left position relative to parent in px
       };
       new Spinner(opts).spin(this.$().get(0))
       return this._super();
    },
    willDestroyElement: function(){
      $("body").removeClass("fullscreen-open")
      return this._super();
    }
  });

  App.ApplicationRoute = Ember.Route.extend({
    actions: {
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

    model : function () {
      return Em.Deferred.promise(function(p) {
        Ember.run.once(function() {
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
        return item.login == params.profile_id;                   
      });

    },
    serialize: function (model) {
      return { profile_id: model.get("login")}
    },

    afterModel : function (model) {
      return model.loadDetails();
    }
  })

  App.AccountController = Ember.ObjectController.extend({
    needs: ["purchaseForm","cancelForm", "updateCard"],  
    actions: {
      purchase: function (model) {
        var org = this.get("model.details.org");
        var details = this.get('model.details');
        plan = Ember.Object.create({plan: model, org:org, details: details})
        this.set("controllers.purchaseForm.model", plan)
        this.send("openModal","purchaseForm")
      },
      updateCard: function (model) {
        var org = this.get("model.details.org");
        card = Ember.Object.create({card: model, org:org})
        this.set("controllers.updateCard.model", card)
        this.send("openModal","updateCard")
      },
      cancel: function (model) {
        var org = this.get("model.details.org");
        var details = this.get('model.details');
        plan = Ember.Object.create({plan: model, org:org, details: details})
        this.set("controllers.cancelForm.model", plan)
        this.send("openModal","cancelForm")
      
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

    $('body').removeClass("fullscreen-open");
    promise.resolve();


    return promise.promise;
  };

  App.animateModalOpen = function() {
    var promise = new Ember.RSVP.defer();

     $('body').addClass("fullscreen-open");
    promise.resolve();
    

    return promise.promise;
  };

})(this);

