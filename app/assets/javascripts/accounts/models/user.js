User = Ember.Object.extend({
  gravatar_url : function() {
    return this.get("avatar_url")

  }.property("avatar_url"),

  loadDetails : function () {
    var user = this; 
    return new Em.RSVP.Promise(function(resolve) {
      resolve($.getJSON("/api/profiles/user").then(function (response) {
        user.set("details", response)
        return response;
      }));
    });
  },
  loadHistory : function () {
    var user = this; 
    return new Em.RSVP.Promise(function(resolve) {
      resolve($.getJSON("/api/profiles/"+ user.get("login") + "/history").then(function (response) {
        user.set("history", response)
        return response;
      }));
    });
  }
});

module.exports = User;
