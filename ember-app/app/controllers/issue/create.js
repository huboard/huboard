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
      this.set("model.labels", []);
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
       if(controller.get("issueIsLinked")){
         controller.colorIssue(issue);
         controller.send("assignRepo", controller.get("controllers.application.model.board"));
       }
       controller.send("issueCreated", issue);
       controller.set("processing",false);
    });
  },
  allRepos: function(){
    var linked = this.get("controllers.application.model.board.linkedRepos");
    var board = this.get("controllers.application.model.board");
    return _.union([_.clone(board)], linked);
  }.property("controllers.application.model.board.linkedRepos"),
  issueIsLinked: function(){
    return this.get("model.repo.full_name") !== this.get("controllers.application.model.board.full_name");
  }.property("controllers.application.model.board.full_name", "model.repo.full_name"),
  colorIssue: function(issue){
    var linked_labels = this.get("controllers.application.model.board.link_labels");
    var label = _.find(linked_labels, function(l){
      var name = l.user + "/" + l.repo;
      return name === issue.repo.full_name;
    });
    issue.color = label.color;
  }
});

export default IssuesCreateController;
