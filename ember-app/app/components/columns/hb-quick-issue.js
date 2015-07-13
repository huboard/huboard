import Ember from "ember";
import Issue from "app/models/forms/create-issue";

var HbQuickIssueComponent = Ember.Component.extend({
  classNames: ["create-issue"],
  placeholderText: "Add issue...",

  model: Issue.createNew(),
  clearModel: function(){
    this.set("model", Issue.createNew());
  }.observes("issueCreated"),
  issueCreated: 0,

  isValid: function(){
    return this.get("model.title").trim() !== "";
  }.property("model.title"),

  actions: {
    openFullScreen: function(){
      //TODO: figure out milestone when implementing ms columns
      //model.set("milestone", this.get("model.milestone"));
      var order = this.get("parentView.topOrderNumber");
      this.attrs.createFullscreenIssue(this.get("model"), order);
    },
    onQuickAdd: function(){
      if (!this.get("isValid")) {return;}
      this.set("processing", true);
      var order = this.get("parentView.topOrderNumber");

      self = this;
      this.get("model").save(order).then(function(issue){
        self.attrs.createNewIssue(issue);
        self.incrementProperty("issueCreated");
        self.set("processing", false);
      });
    }
  }
});

export default HbQuickIssueComponent;
