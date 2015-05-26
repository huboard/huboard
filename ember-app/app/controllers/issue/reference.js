import Ember from 'ember';
import ajax from 'ic-ajax';

var IssueReferenceController = Ember.Controller.extend({
  needs: ["issue"],

  fetchCommit: function(commit){
    var repo = this.get("controllers.issue.repo.full_name");
    return ajax("/api/" + repo + "/commit/" + commit)
      .then(function(response){
        return response;
      });
  }
});

export default IssueReferenceController;
