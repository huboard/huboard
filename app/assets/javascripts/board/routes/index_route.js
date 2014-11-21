var CssView = require("../views/css_view");
var Board = require("../models/board");

var IndexRoute = Ember.Route.extend({
  model: function(){
    var repo = this.modelFor("application");
    return repo.fetchBoard();
  },
  afterModel: function (model){
    if(App.get("isLoaded")) {
      return;
    }
    var cssView = CssView.create({
      content: model
    });
    cssView.appendTo("head")
    App.set("isLoaded", true); 
    //TODO: figure out how to subscribe to linked repo events
    //var socket = this.get("socket");
    //socket.subscribeTo(b.full_name);
  },
  renderTemplate: function() {

    this._super.apply(this, arguments);
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
      var issues = controller.get("model.columns.firstObject.issues")
      issues.pushObject(issue);
      Ember.run.schedule('afterRender', controller, function () {
        controller.incrementProperty("forceRedraw");
        this.send("closeModal")
      }.bind(this))
    }
  }
});

module.exports = IndexRoute;
