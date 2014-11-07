var IssueCreateController = require("./create_controller.js");

var IssueQuickCreateController = IssueCreateController.extend({
  actions: {
    openFullScreen: function(){
      var model = App.Issue.createNew();
      model.set('title', this.get('title'));
      model.set('milestone', this.get('milestone'));
      var leOrder = this.get("target.topOrderNumber")
      this.send("createNewIssue", model, leOrder);
      this.set('model.title', '');
    },
    onQuickAdd: function(){
      if (this.get('model.title').trim() == "") {
        return ;
      }
      var leOrder = this.get("target.topOrderNumber")
      this.createIssue(leOrder);
      this.set('model.title', '');
    }
  }
});

module.exports = IssueQuickCreateController;
