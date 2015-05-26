import Ember from 'ember';

var LoginController = Ember.Controller.extend({
  authLevel: function(){
    return App.get("authLevel").capitalize();
  }.property("authLevel"),

  loginUrl: function(){
    var url = "/login/" + App.get("authLevel") + "?redirect_to=";
    var location = window.location.pathname + window.location.hash;
    var redirectParam = encodeURIComponent(location);
    return url + redirectParam;
  }.property("authLevel"),
});

export default LoginController;
