var CssView = require("../views/css_view");

var IndexRoute = Ember.Route.extend({
  model: function(){
    var repo = this.modelFor("application");
    return repo.fetchBoard(repo);
  },
  afterModel: function (model){
    if(App.get("isLoaded")) {
      return;
    }
    var cssView = CssView.create({
      content: model
    });
    cssView.appendTo("head")
    return model.loadLinkedBoards().then(function(boards) {
     App.set("isLoaded", true); 
     var socket = this.get("socket");
     boards.forEach(function(b) {
       socket.subscribeTo(b.full_name);
     });
    }.bind(this));
  },
  renderTemplate: function() {
    
    this._super.apply(this, arguments);
    this.render('filters', {into: 'index', outlet: 'sidebarMiddle'})
  },
  actions : {
    createNewIssue : function () {
      this.controllerFor("issue.create").set("model", App.Issue.createNew());
      this.send("openModal","issue.create")
    },
    archive: function (issue) {
      issue.archive();
    },
    openIssueFullscreen: function(model){
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
      }.bind(this))
    }
  }
});

module.exports = IndexRoute;
