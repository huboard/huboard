import Ember from "ember";
import Issue from 'app/models/forms/create-issue';

var HbQuickIssueComponent = Ember.Component.extend({
  //needs the issue will need repo.full_name
  //issue.createNew().save(order)

  model: Issue.createNew(),
  clearModel: function(){
    this.set("model", Issue.createNew());
  }.observes("issueCreated"),
  issueCreated: 0,

  placeholderText: "Add issue...",

  classNames: ["create-issue"],
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
      var leOrder = this.get("parentView.topOrderNumber");
      this.createIssue(leOrder);
      this.set('model.title', '');
    }
  }
});

export default HbQuickIssueComponent;
