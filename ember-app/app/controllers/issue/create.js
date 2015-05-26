import Ember from 'ember';

var IssuesCreateController = Ember.ObjectController.extend({
  needs: ["application"],
  isCollaborator: Ember.computed.alias("selectedBoard.repo.permissions.push"),
  selectedBoard: function(){
    var selectedRepo = this.get('model.repo'),
      selectedBoard = this.get('allRepos').find(function(board){
        return selectedRepo.get('full_name').toLowerCase() ===
          board.get('full_name').toLowerCase();
      });
      return selectedBoard;
  }.property('model.repo', 'allRepos.@each'),
  otherLabels: Ember.computed.alias("selectedBoard.other_labels"),
  assignees: Ember.computed.alias("selectedBoard.assignees"),
  milestones: Ember.computed.alias("selectedBoard.milestones"),
  columns: "selectedBoard.columns",
  disabled: function () {
      return this.get("processing") || !this.get("isValid");
  }.property("processing","isValid"),
  isValid: function () {
    return this.get("model.title");
  }.property("model.title"),
  mentions: function(){
    return _.uniq(_.compact(this.get('selectedBoard.assignees')), function(i){
      return i.login;
    });
  }.property('selectedBoard','selectedBoard.assignees'),
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
  }.property("controllers.application.model.board.full_name","model.repo", "model.repo.full_name"),
  colorIssue: function(issue){
    var linked_labels = this.get("controllers.application.model.board.link_labels");
    var label = _.find(linked_labels, function(l){
      var name = l.user + "/" + l.repo;
      return name === issue.repo.full_name;
    });
    issue.color = label.color;
  },
  actions: {
    submit: function() {
      this.createIssue(this.get("order"));
    },
    assignRepo: function(repo){
      this.set('model.assignee', null);
      this.set('model.milestone', null);
      this.set("model.labels", []);
      //this.set("model.repo", repo);
    }
  }
});

export default IssuesCreateController;
