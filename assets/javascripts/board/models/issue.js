
var Serializable = require("../mixins/serializable");

var Issue = Ember.Object.extend(Serializable,{
  saveNew: function () {
    return Ember.$.ajax( {
      url: "/api/v2/" + this.get("repo.full_name") + "/issues/create", 
      data: JSON.stringify(this.serialize()),
      dataType: 'json',
      type: "POST",
      contentType: "application/json"}).then(function(response){
      return Issue.create(response);
    })
  },
  processing: false,
  archive: function() {
     this.set("processing", true);
      var user = this.get("repo.owner.login"),
          repo = this.get("repo.name"),
          full_name = user + "/" + repo;

      return Ember.$.post("/api/" + full_name + "/archiveissue", {
        number : this.get("number")
      }).then(function () {
        this.set("processing", false);
        this.set("isDestroying", true);
      }.bind(this))
  },
  drag: function (column) {
      this.set("current_state", column)
      // this is weird
      var user = this.get("repo.owner.login"),
          repo = this.get("repo.name"),
          full_name = user + "/" + repo;

      return Ember.$.post("/api/" + full_name + "/movecard", {
        index : column.index.toString(),
        number : this.get("number")
      })
  },
  close: function () {
     this.set("processing", true);

      var user = this.get("repo.owner.login"),
          repo = this.get("repo.name"),
          full_name = user + "/" + repo;

      Ember.$.post("/api/" + full_name + "/close", {
        number : this.get("number")
      }).then(function() {
        this.set("state","closed")
        this.set("processing", false);
      }.bind(this))
  },
  reorder: function (index) {
      this.set("_data.order", index);

      var user = this.get("repo.owner.login"),
          repo = this.get("repo.name"),
          full_name = user + "/" + repo;

      return Ember.$.post("/api/" + full_name + "/reorderissue", {
        number : this.get("number"),
        index: index.toString()
      }).then(function( response ){
         this.set("_data.order", response._data.order);
         return this;
      }.bind(this))
  
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
       repo: App.get("repo"),
       labels: []
     })
  }
});

module.exports = Issue;

