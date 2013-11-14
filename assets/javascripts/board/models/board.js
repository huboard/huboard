var Board = Ember.Object.extend({
});

Board.reopenClass({
  fetch: function(repo) {
    return Ember.$.getJSON("/api/v2/" + repo.get("full_name") + "/board").then(function(board){
       var issues = Ember.A();
       board.issues.forEach(function(i){
         issues.pushObject(App.Issue.create(i));
       })
       return Board.create(_.extend(board, {issues: issues}));
    });
  }
})

module.exports = Board;

