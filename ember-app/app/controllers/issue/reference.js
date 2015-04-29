import Ember from 'ember';

var IssueReferenceController = Ember.ObjectController.extend({
  needs: ["issue"],

  fetchCommit: function(commit){
    var repo = this.get("controllers.issue.repo.full_name");
    return Ember.$.getJSON("/api/" + repo + "/commit/" + commit)
      .then(function(commit){
        return commit;
      }.bind(this));
  }
});

export default IssueReferenceController;
