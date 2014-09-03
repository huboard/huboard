var CssView = require("../views/css_view");
module.exports = MilestonesRoute =  Ember.Route.extend({
  model: function () {
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
    this.render('assignee', {into: 'milestones', outlet: 'sidebarTop'})
    this.render('filters', {into: 'milestones', outlet: 'sidebarMiddle'})
  },
  actions :{
    createNewIssue : function () {
      this.controllerFor("issue.create").set("model", App.Issue.createNew());
      this.send("openModal","issue.create")
    },
    createNewMilestone : function () {
      this.controllerFor("milestone.create").set("model", App.Milestone.createNew());
      this.send("openModal","milestone.create")
    },
    editMilestone : function (milestone) {
      this.controllerFor("milestone.edit").set("model", App.Milestone.create(milestone));
      this.send("openModal","milestone.edit")
    },
    archive: function (issue) {
      issue.archive();
    },
    openIssueFullscreen: function(model){
      this.transitionTo("milestones.issue", model)
    },
    forceRepaint: function(target){
      if(target === "index") {
        return;
      }
      var controller = this.controllerFor("milestones");
      controller.incrementProperty("forceRedraw")
    },
    issueCreated: function(issue){
      var controller = this.controllerFor("milestones");
      var issues = controller.get("model.issues");
      issues.pushObject(issue);
      Ember.run.schedule('afterRender', controller, function () {
        controller.incrementProperty("forceRedraw");
        this.send("closeModal")
      }.bind(this))
    },
    milestoneCreated: function(milestone){
      var controller = this.controllerFor("milestones");
      var milestones = controller.get("model.milestones");
      milestones.pushObject(milestone);
      Ember.run.schedule('afterRender', controller, function () {
        controller.incrementProperty("forceRedraw");
        this.send("closeModal")
      }.bind(this))
    },
    milestoneUpdated: function(milestone){
      var controller = this.controllerFor("milestones");
      var milestones = controller.get("model.milestones");
      Ember.run.schedule('afterRender', controller, function () {
        controller.incrementProperty("forceRedraw");
        this.send("closeModal")
      }.bind(this))
    }
  }

})
