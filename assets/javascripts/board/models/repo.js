
var Repo = Ember.Object.extend({
  userUrl :function () {
    return "/" + this.get("owner.login");
  }.property("owner.login"),
  repoUrl :function () {
    return this.get("userUrl") + "/" + this.get("name");
  }.property("name", "userUrl")
});

module.exports = Repo;
