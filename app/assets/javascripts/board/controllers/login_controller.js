LoginController = Ember.ObjectController.extend({
  authLevel: function(){
    return App.get("authLevel").capitalize();
  }.property("App.authLevel"),

  loginUrl: function(){
    var url = "/login/" + App.get("authLevel") + "?redirect_to=";
    var location = window.location.pathname + window.location.hash;
    var redirectParam = encodeURIComponent(location);
    return url + redirectParam  
  }.property("App.authLevel"),
});

module.exports = LoginController;
