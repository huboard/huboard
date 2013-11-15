
var Serializable = require("../mixins/serializable");

var Issue = Ember.Object.extend(Serializable,{
  saveNew: function () {
    return Ember.$.post("/api/v2/" + this.get("repo.full_name") + "/issues/create", this.serialize()).then(function(response){
      return Issue.create(response);
    })
  }
});

Issue.reopenClass({
  createNew: function(){
     return Issue.create({
       id: null,
       title: "",
       body: "",
       assignee: null,
       milestone: null,
       repo: App.get("repo")
     })
  }
});

module.exports = Issue;

