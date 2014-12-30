LoginController = Ember.ObjectController.extend({
  privateLoginUrl: function(){
    var privateUrl = "/login/private?redirect_to=";
    var redirectParam = encodeURIComponent(window.location.pathname);
    return privateUrl + redirectParam;
  }.property()
});

module.exports = LoginController;
