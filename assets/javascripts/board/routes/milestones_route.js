var CssView = require("../views/css_view");
module.exports = MilestonesRoute =  Ember.Route.extend({
  model: function () {
    var repo = this.modelFor("application");
    return App.Board.fetch(repo);
  },
  afterModel: function (model){
    if(this._loaded) {
      return;
    }
    var cssView = CssView.create({
      content: model
    });
    cssView.appendTo("head")
    this._loaded = true; 
  },

  renderTemplate: function() {
    this._super.apply(this, arguments);
  },
  actions :{
    createNewIssue : function () {
      this.controllerFor("issue.create").set("model", App.Issue.createNew());
      this.send("openModal","issue.create")
    }
  }

})
