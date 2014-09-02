var Board = require("./board");
var Issue = require("./issue");

var Serializable = require("../mixins/serializable");
var Repo = Ember.Object.extend(Serializable,{
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
  }.property("repoUrl"),
  fetchBoard: function(){

    if(this._board) {return this._board;}
    return Ember.$.getJSON("/api/" + this.get("full_name") + "/board").then(function(board){
       var issues = Ember.A();
       board.issues.forEach(function(i){
         issues.pushObject(Issue.create(i));
       })
       this._board =  Board.create(_.extend(board, {issues: issues}));
       this.set("board", this._board);
       return this._board;
    }.bind(this));
  },
  fetchIntegrations: function() {
    if(this._integrations) {return this._integrations;}
    return Ember.$.getJSON("/api/" + this.get("full_name") + "/integrations")
      .then(function(integrations){
        var results = Ember.A();
        integrations.rows.forEach(function(i){
          results.pushObject(App.Integration.create(i.value));
        })
        this._integrations = Ember.Object.create({ 
          integrations: results 
        })
        return this._integrations;
      }.bind(this));

  },
  fetchLinks: function() {
    if(this._links) {return this._links;}
    return Ember.$.getJSON("/api/" + this.get("full_name") + "/links")
      .then(function(links){
        var results = Ember.A();
        links.forEach(function(l){
          results.pushObject(App.Link.create(l));
        })
        this._links = Ember.Object.create({ 
          links: results 
        })
        return this._links;
      }.bind(this));

  }
});

module.exports = Repo;
