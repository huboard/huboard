import IssueCreateController from 'app/controllers/issue/create';
import Issue from 'app/models/forms/create-issue';


var IssueQuickCreateController = IssueCreateController.extend({
  actions: {
    openFullScreen: function(){
      var model = Issue.createNew();
      model.set('title', this.get('model.title'));
      model.set('milestone', this.get('model.milestone'));
      var leOrder = this.get("target.topOrderNumber");
      this.send("createNewIssue", model, leOrder);
      this.set('model.title', '');
    },
    onQuickAdd: function(){
      if (this.get('model.title').trim() === "") {
        return ;
      }
      var leOrder = this.get("target.topOrderNumber");
      this.createIssue(leOrder);
      this.set('model.title', '');
    }
  }
});

export default IssueQuickCreateController;
