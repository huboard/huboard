var CssView = require("../views/css_view");

var IndexRoute = Ember.Route.extend({
  model: function(){
    var repo = this.modelFor("application");
    return App.Board.fetch(repo);
  },
  afterModel: function (model){
    var cssView = CssView.create({
      content: model
    });
    cssView.appendTo("head")
    return model.loadLinkedBoards();
  },
  renderTemplate: function() {
    
    this._super.apply(this, arguments);
    this.render('filters', {into: 'index', outlet: 'sidebarMiddle'})
    this.render('assignee', {into: 'index', outlet: 'sidebarTop'})
  },
  actions :{
    createNewIssue : function () {
      this.controllerFor("issue.create").set("model", App.Issue.createNew());
      this.send("openModal","issue.create")
    }
  }

});

module.exports = IndexRoute;
