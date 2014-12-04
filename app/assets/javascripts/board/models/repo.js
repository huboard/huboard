var Board = require("./board");
var Issue = require("./issue");
var Column = require("./column");
var Milestone = require("./milestone");
var NoMilestone = Milestone.extend({
  title: "No milestone", 
  noMilestone: true,
  orderable: false,
  cssClass: 'no-milestone',
  group: [],
  filterBy: function(i) {
    return !Ember.get(i, "milestone");
  }
})

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
    var linked_boards = this.fetchLinkedBoards();
    return Ember.$.getJSON("/api/" + this.get("full_name") + "/board").then(function(board){
       var issues = Ember.A();
       board.issues.forEach(function(i){
         issues.pushObject(Issue.create(i));
       })
       var columns = Ember.A();
       board.columns.forEach(function(column){
         columns.pushObject(Column.build(column, issues));
       })
       
       var milestoneColumns = Ember.ArrayProxy.extend(Ember.SortableMixin).create({
         content: [],
         sortProperties: ["milestone._data.order"]
       });

       board.milestones.forEach(function(milestone){
         milestoneColumns.pushObject(Milestone.build(milestone, issues))
       })

       var noMilestone = NoMilestone.build(null, issues)
       




       var parentBoard = this._board =  Board.create(_.extend(board, {issues: issues, 
                                                              columns: columns, 
                                                              milestoneColumns: milestoneColumns,
                                                              noMilestoneColumn: noMilestone}));
       linked_boards.then(function(boardsPromise){
         boardsPromise.then(function(boards){
          boards.forEach(function(b) {
            if(b.failure) {return;}

            var issues = Ember.A();
            b.issues.forEach(function(i){
              issues.pushObject(App.Issue.create(i));
            })

            b.milestones.forEach(function(milestone){
              var parentMilestone = parentBoard.milestoneColumns.find(function(column){
                return column.get('milestone') && (column.get("title").toLowerCase() == milestone.title.toLowerCase());
              })
              
              if(parentMilestone) {
                parentMilestone.merge(milestone, issues);
              } else {
                parentBoard.milestoneColumns.pushObject(Milestone.build(milestone, issues))
              }
            })

            parentBoard.noMilestoneColumn.merge(null, issues);

            parentBoard.columns.forEach(function(column){
              column.merge(issues);
            })
            var board = Board.create(_.extend(b, {issues: issues, columns: parentBoard.columns}));
            parentBoard.linkedRepos.pushObject(board);
            // FIXME: this is lame-o
            App.__container__.lookup("socket:main").subscribeTo(b.full_name)
          });
         });
       });
       this.set("board", this._board);
       return this._board;
    }.bind(this));
  },
  fetchLinkedBoards: function(){
    var self = this;
    return Ember.$.getJSON("/api/" + self.get("full_name") + "/link_labels")
    .then(function(link_labels){
      urls = link_labels.map(function (l) {
        return "/api/" + self.get("full_name") + "/linked/" + l.user + "/" + l.repo  
      })

      var requests = urls.map(function (url){
        return Ember.$.getJSON(url);
      });

      return Ember.RSVP.all(requests).then(function(boards){
        return boards;
      });
    });
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
  fetchSettings: function(){
    if(this._settings) {return this._settings;}
    return Ember.$.getJSON("/api/" + this.get("full_name") + "/settings")
  },
  fetchLinks: function() {
    if(this._links) {return Ember.RSVP.resolve(this._links,"Already fetched links");}
    return Ember.$.getJSON("/api/" + this.get("full_name") + "/links")
      .then(function(links){
        var results = Ember.A();
        links.forEach(function(l){
          results.pushObject(App.Link.create(l));
        })
        this._links = results; 
        return this._links;
      }.bind(this));

  },
  createLink: function(name){
    var board = this;
    return this.fetchLinks().then(function(links){
      var api = "/api/" + board.get("full_name") + "/links";
      return Ember.$.ajax({
        url: api,
        type: 'POST',
        dataType: 'json',
        data: {link: name},
        success: function(response){
          links.pushObject(Ember.Object.create(response));
        }
      })
    })

  }
});

module.exports = Repo;
