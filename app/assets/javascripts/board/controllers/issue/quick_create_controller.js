var IssuesCreateController = require("./create_controller.js");

var IssuesQuickCreateController = IssuesCreateController.extend({
  actions: {
    openFullScreen: function(){
      var model = App.Issue.createNew();
      model.set('title', this.get('title'));
      model.set('milestone', this.get('milestone'));
      this.send("createNewIssue", model);
      this.set('model.title', '');
    },
    onQuickAdd: function(){
      this.createIssue();
      this.set('model.title', '');
    }
  }
});

module.exports = IssuesQuickCreateController;
