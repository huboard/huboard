import Ember from 'ember';

var IndexLoadingRoute = Ember.Route.extend({
  renderTemplate: function(){
    this.render('loading', {
      into: 'application',
      outlet: 'loading',
      view: 'loading'
    });
    return true;
  }
});

export default IndexLoadingRoute;
