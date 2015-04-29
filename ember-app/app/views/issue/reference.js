import Ember from 'ember';

var ReferenceView = Ember.View.extend({
  classNames: ["issue-reference-info"],
  isVisible: false,
  isProcessing: false,
  commit: null,
  commitUrl: Ember.computed.alias("commit.html_url"),
  message: Ember.computed.alias("commit.commit.message"),
  shortSha: function(){
    if (this.get("commit") === null){
      return "";
    }
    return this.get("commit.sha").substr(0,7);
  }.property("commit.sha"),

  didInsertElement: function(){
    this.set("model", this.get("parentView.content.model"));

    var self = this;
    var reference = this.$().closest(".card-event");
    reference.hover(function(){
      if (self.get("commit") === null) {
        self.fetchCommit();
      }
      self.set("isVisible", true);
    });
  },
  fetchCommit: function(){
    if(this.get("isProcessing")){
      return;
    }
    this.set("isProcessing", true);
    var self = this;
    var commit = this.get("model.commit_id");
    this.get("controller").fetchCommit(commit)
      .then(function(commit){
        self.set("isProcessing", false);
        self.set("commit", commit);
      })
      .fail(function(){
        self.set("isProcessing", false);
      });
  }
});

export default ReferenceView;
