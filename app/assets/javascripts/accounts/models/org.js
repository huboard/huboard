Org = Ember.Object.extend({
  gravatar_url : function() {
    return this.get("avatar_url") 

  }.property("avatar_url"),

  loadDetails : function () {
    var org = this; 
    return new Em.RSVP.Promise(function(resolve) {
      resolve($.getJSON("/api/profiles/"+ org.get("login")).then(function (response) {
        org.set("details", response)
        return response;
      }));
    });
  },
  loadHistory : function () {
    var org = this; 
    return new Em.RSVP.Promise(function(resolve) {
      resolve($.getJSON("/api/profiles/"+ org.get("login") + "/history").then(function (response) {
        org.set("history", response)
        return response;
      }));
    });
  }
});

module.exports = Org;
