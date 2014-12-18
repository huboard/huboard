var CssView = require("../views/css_view");
var Board = require("../models/board");

var IndexRoute = Ember.Route.extend({
  model: function(){
    var repo = this.modelFor("application");
    var linked_boards = repo.fetchLinkedBoards();
    return repo.fetchBoard(linked_boards);
  },
  afterModel: function (model){
    if(App.get("isLoaded")) {
      return;
    }
    var cssView = CssView.create({
      content: model
    });
    cssView.appendTo("head")
    return model.linkedBoardsPreload.done(function(linkedBoardsPromise){
     App.set("isLoaded", true); 
     var socket = this.get("socket");
     return linkedBoardsPromise.then(function(boards){
       boards.forEach(function(b) {
        if(b.failure) {return;}
         var issues = Ember.A();
         b.issues.forEach(function(i){
           issues.pushObject(App.Issue.create(i));
         })
         var board = Board.create(_.extend(b, {issues: issues}));
         model.linkedRepos.pushObject(board);
         socket.subscribeTo(b.full_name);
       });
       return boards;
     });
    }.bind(this));
  },
  renderTemplate: function() {
    
    this._super.apply(this, arguments);
    this.render('assignee', {into: 'index', outlet: 'sidebarTop'})
    this.render('filters', {into: 'index', outlet: 'sidebarMiddle'})
  },
  actions : {
    createNewIssue : function (model, order) {
      this.controllerFor("issue.create").set("model", model || App.Issue.createNew());
      this.controllerFor("issue.create").set("order", order || {});
      this.send("openModal","issue.create")
    },
    archive: function (issue) {
      issue.archive();
    },
    openIssueFullscreen: function(model){
      App.get("_queryParams").stashQueryParams(this.get("controller"));
      this.transitionTo("index.issue", model)
    },
    forceRepaint: function(target) {
      if(target === "milestones") {
        return;
      }
      var controller = this.controllerFor("index");
      controller.incrementProperty("forceRedraw")
    },
    issueCreated: function(issue){
      var controller = this.controllerFor("index");
      var issues = controller.get("model.issues")
      issues.pushObject(issue);
      Ember.run.schedule('afterRender', controller, function () {
        controller.incrementProperty("forceRedraw");
        this.send("closeModal")
        App.get("_queryParams").restoreQueryParams();
      }.bind(this))
    }
  }
});

module.exports = IndexRoute;
