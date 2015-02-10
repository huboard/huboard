var LoadingRoute = Ember.Route.extend({
  renderTemplate: function() {
    if(this.router._activeViews.application){
      return this.render({ "into" : "application", "outlet" : "loading"});
    }
    this.render("loading");
  }
});

module.exports = LoadingRoute;
