var Board = Ember.Object.extend({
});

Board.reopenClass({
  fetch: function(repo) {
    if(this._board) {return this._board;}
    return Ember.$.getJSON("/api/v2/" + repo.get("full_name") + "/board").then(function(board){
       var issues = Ember.A();
       board.issues.forEach(function(i){
         issues.pushObject(App.Issue.create(i));
       })
       this._board =  Board.create(_.extend(board, {issues: issues}));
       return this._board;
    }.bind(this));
  }
})

module.exports = Board;

