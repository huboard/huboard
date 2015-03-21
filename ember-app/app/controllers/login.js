;
LoginController = Ember.ObjectController.extend({
  authLevel: function(){
    return get("authLevel").capitalize();
  }.property("authLevel"),

  loginUrl: function(){
    var url = "/login/" + get("authLevel") + "?redirect_to=";
    var location = window.location.pathname + window.location.hash;
    var redirectParam = encodeURIComponent(location);
    return url + redirectParam  
  }.property("authLevel"),
});

export default LoginController;
