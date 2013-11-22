
var Repo = Ember.Object.extend({
  userUrl :function () {
    return "/" + this.get("owner.login");
  }.property("owner.login"),
  repoUrl :function () {
    return this.get("userUrl") + "/" + this.get("name");
  }.property("name", "userUrl"),
  backlogUrl: function () {
     return this.get("repoUrl") + "/backlog";
  }.property("repoUrl"),
  betaUrl: function () {
     return this.get("repoUrl") + "/beta";
  }.property("repoUrl")
});

module.exports = Repo;
