var CssView = require("../views/css_view");
var Board = require("../models/board");

module.exports = MilestonesRoute =  Ember.Route.extend({
  model: function () {
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
  },

  renderTemplate: function() {
    this._super.apply(this, arguments);
    this.render('assignee', {into: 'milestones', outlet: 'sidebarTop'})
    this.render('filters', {into: 'milestones', outlet: 'sidebarMiddle'})
  },
  actions :{
    createNewIssue : function (model, order) {
      this.controllerFor("issue.create").set("model", model || App.Issue.createNew());
      this.controllerFor("issue.create").set("order", order || {});
      this.send("openModal","issue.create")
    },
    archive: function (issue) {
      issue.archive();
    },
    openIssueFullscreen: function(model){
      this.transitionTo("milestones.issue", model)
    },
    createMilestoneOrAbort: function(argBag) { 
      this.render("milestones.missing", {
        into: "application",
        outlet: "modal",
        model: argBag
      })
    },
    forceRepaint: function(target){
      if(target === "index") {
        return;
      }
      var controller = this.controllerFor("milestones");
      controller.incrementProperty("forceRedraw")
    },
    issueCreated: function(issue){
      this.modelFor('application').addIssue(issue);
      Ember.run.schedule('afterRender', function () {
        this.send("closeModal")
      }.bind(this))
    }
  }

})
