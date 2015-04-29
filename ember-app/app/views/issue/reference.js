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
    var container = this.$().closest(".card-event");
    container.hover(function(){
      self.set("isVisible", true);
      if (self.get("commit") === null) {
        self.fetchCommit();
      }
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
        self.doubleContainerHeight();
        self.set("isProcessing", false);
        self.set("commit", commit);
      })
      .fail(function(){
        self.set("isProcessing", false);
      });
  },
  doubleContainerHeight: function(){
    var container = this.$().closest(".card-event");
    var height = (container.height() * 2)
    container.height(height);
  }
});

export default ReferenceView;
