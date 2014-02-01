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
    return model.loadLinkedBoards().then(function() {
     App.set("isLoaded", true); 
    }.bind(this));
  },

  renderTemplate: function() {
    this._super.apply(this, arguments);
    //this.render('assignee', {into: 'milestones', outlet: 'sidebarTop'})
    this.render('filters', {into: 'milestones', outlet: 'sidebarMiddle'})
  },
  actions :{
    createNewIssue : function () {
      this.controllerFor("issue.create").set("model", App.Issue.createNew());
      this.send("openModal","issue.create")
    },
    openIssueFullscreen: function(model){
      this.transitionTo("milestones.issue", model)
    }
  }

})
