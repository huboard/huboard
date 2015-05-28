import Ember from "ember";

var UnauthorizedRoute = Ember.Route.extend({
  renderTemplate: function(){
    this.render("unauthorized", { 
      into: 'application',
      outlet: 'modal'
    });
  }
});

export default UnauthorizedRoute;
