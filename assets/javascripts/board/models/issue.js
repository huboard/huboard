
var Serializable = require("../mixins/serializable");

var Issue = Ember.Object.extend(Serializable,{
  saveNew: function () {
    return Ember.$.post("/api/v2/" + this.get("repo.full_name") + "/issues/create", this.serialize()).then(function(response){
      return Issue.create(response);
    })
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
       repo: App.get("repo")
     })
  }
});

module.exports = Issue;

