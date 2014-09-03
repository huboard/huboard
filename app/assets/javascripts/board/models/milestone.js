var correlationId = require("../utilities/correlationId")
var Serializable = require("../mixins/serializable");

var Milestone = Ember.Object.extend(Serializable,{
  correlationId: correlationId,
  saveNew: function () {
    return Ember.$.ajax( {
      url: "/api/" + this.get("repo.full_name") + "/milestones",
      data: JSON.stringify({milestone: this.serialize(), correlationId: this.get("correlationId") }),
      dataType: 'json',
      type: "POST",
      contentType: "application/json"}).then(function(response){
      return Milestone.create(response);
    })
  },
  saveEdit: function () {
    var user = this.get("repo.owner.login"),
        repo = this.get("repo.name"),
        full_name = user + "/" + repo;

    return Ember.$.ajax( {
      url: "/api/" + full_name + "/milestones/" + this.get("number"),
      data: JSON.stringify({milestone: this.serialize(), correlationId: this.get("correlationId") }),
      dataType: 'json',
      type: "POST",
      contentType: "application/json"}).then(function(response){
      return Milestone.create(response);
    })
  },
  processing: false,
  loaded: false
});

Milestone.reopenClass({
  createNew: function(){
     return Milestone.create({
       id: null,
       title: "",
       description: "",
       due_on: "",
       repo: App.get("repo")
     })
  }
});

module.exports = Milestone;
