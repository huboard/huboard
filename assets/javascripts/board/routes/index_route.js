var IndexRoute = Ember.Route.extend({
  model: function(){
    var repo = this.modelFor("application");

    return Ember.$.getJSON("/api/v2/" + repo.get("full_name") + "/board");

  },
  renderTemplate: function() {
    
    this._super.apply(this, arguments);
    this.render('filters', {into: 'index', outlet: 'sidebar'})
  }

});

module.exports = IndexRoute;
