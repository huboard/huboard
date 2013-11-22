var Board = Ember.Object.extend({
  linkedRepos: [],
  combinedIssues: function () {
     return _.union.apply(_,[this.issues].concat(this.linkedRepos.map(function (r){return r.issues; })));
  },
  loadLinkedBoards: function () {
    var model = this;
    var urls = this.get("link_labels").map(function (l) {
      return "/api/v2/" + model.full_name + "/linked/" + l.user + "/" + l.repo  
    })

    var requests = urls.map(function (url){
      return Ember.$.getJSON(url);
    })

    return Ember.RSVP.all(requests).then(function (boards){
      boards.forEach(function (b){
         var issues = Ember.A();
         b.issues.forEach(function(i){
           issues.pushObject(App.Issue.create(i));
         })

         var board =  Board.create(_.extend(b, {issues: issues}));

         model.linkedRepos.pushObject(b)
      })
    })
  }
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

