LoginController = Ember.ObjectController.extend({
  privateLoginUrl: function(){
    var privateUrl = "/login/private?redirect_to=";
    var location = window.location.pathname + window.location.hash;
    var redirectParam = encodeURIComponent(location);
    return privateUrl + redirectParam  
  }.property()
});

module.exports = LoginController;
