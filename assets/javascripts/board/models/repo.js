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
  }
});

module.exports = Repo;
