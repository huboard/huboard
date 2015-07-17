import Ember from "ember";
import Issue from "app/models/forms/create-issue";

var HbQuickIssueComponent = Ember.Component.extend({
  classNames: ["create-issue"],
  placeholderText: "Add issue...",

  initModel: function(){
    this.set("model", Issue.createNew());
  }.on("init"),
  clearModel: function(){
    this.set("model", Issue.createNew());
  }.observes("issueCreated"),
  issueCreated: 0,

  isValid: function(){
    return this.get("model.title").trim() !== "";
  }.property("model.title"),

  actions: {
    openFullScreen: function(){
      this.set("model.milestone", this.get("column.milestone"));
      var order = this.get("parentView.topOrderNumber");
      this.attrs.createFullscreenIssue(this.get("model"), order);
    },
    onQuickAdd: function(){
      if (!this.get("isValid")) {return;}
      this.set("processing", true);
      var order = this.get("parentView.topOrderNumber");
      this.set("model.milestone", this.get("column.milestone"));

      self = this;
      this.get("model").save(order).then(function(issue){
        Ember.run.once(function(){
          self.attrs.createNewIssue(issue);
          self.incrementProperty("issueCreated");
          self.set("processing", false);
        });
      });
    }
  }
});

export default HbQuickIssueComponent;
