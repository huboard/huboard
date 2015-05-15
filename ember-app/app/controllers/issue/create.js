import Ember from 'ember';

var IssuesCreateController = Ember.ObjectController.extend({
  needs: ["application"],
  actions: {
    submit: function() {
      this.createIssue(this.get("order"));
    },
    assignRepo: function(repo){
      this.set("model.repo.full_name", repo.full_name);
      this.set("otherLabels", repo.other_labels);
      this.set("milestones", repo.milestones);
      this.set("assignees", repo.assignees);
    }
  },
  isCollaboratorBinding: "repo.is_collaborator",
  otherLabelsBinding: Ember.Binding.oneWay("controllers.application.model.board.other_labels"),
  assigneesBinding: Ember.Binding.oneWay("controllers.application.model.board.assignees"),
  milestonesBinding: Ember.Binding.oneWay("controllers.application.model.board.milestones"),
  columnsBinding: "controllers.application.model.board.columns",
  disabled: function () {
      return this.get("processing") || !this.get("isValid");
  }.property("processing","isValid"),
  isValid: function () {
    return this.get("model.title");
  }.property("model.title"),
  mentions: function(){
    return _.uniq(_.compact(this.get('controllers.application.model.board.assignees')), function(i){
      return i.login;
    });
  }.property('controllers.application.model.board.assignees'),
  order: {},
  createIssue: function(order){
    if (this.get("processing")){ return; }
    var controller = this;
    this.set("processing",true);
    this.get("model").saveNew(order).then(function(issue){
       controller.send("issueCreated", issue);
       controller.set("processing",false);
    });
  },
  allRepos: function(){
    var linked = this.get("controllers.application.model.board.linkedRepos");
    return _.union([_.clone(this.get("repo"))], linked);
  }.property("controllers.application.model.board.linkedRepos"),
});

export default IssuesCreateController;
