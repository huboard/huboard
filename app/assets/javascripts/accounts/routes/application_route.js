var ApplicationRoute = Ember.Route.extend({
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
    return new Em.RSVP.Promise(function(resolve) {
      Ember.run.once(function() {
        $.getJSON("/api/profiles").then(function(response) {

          var user = App.User.create(response.user);

          var orgs = Em.A();

          response.orgs.forEach(function(org) {
            orgs.pushObject(App.Org.create(org));
          });

          resolve(Ember.Object.create({
            user : user,
            orgs : orgs
          }));


        });
      });
    });
  }
});

module.exports = ApplicationRoute;
