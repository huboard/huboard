import Ember from 'ember';

var IssuesCreateController = Ember.Controller.extend({
  needs: ["application"],
  isCollaborator: Ember.computed.alias("selectedBoard.repo.permissions.push"),
  selectedBoard: function(){
    return this.findBoard(this.get('model.repo'));
  }.property('model.repo', 'allRepos.@each'),
  findBoard: function(repo){
      var selectedBoard = this.get('allRepos').find(function(board){
        return Ember.get(repo, 'full_name').toLowerCase() ===
          Ember.get(board, 'full_name').toLowerCase();
      });
      return selectedBoard;
  },
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
    if (this.get("processing")){ 
      return; 
    }
    var controller = this;
    this.set("processing",true);
    this.get("model").save(order).then(function(issue){
      Ember.run.once(function(){
        if(controller.get("issueIsLinked")){
          controller.colorIssue(issue);
          controller.send("assignRepo", controller.get("controllers.application.model.board"));
        }
        controller.get("target").send("createNewIssue", issue);
        controller.get("target").send("closeModal");
        controller.set("processing", false);
      });
    });
  },
  allRepos: function(){
    var linked = this.get("controllers.application.model.board.linkedRepos");
    var board = this.get("controllers.application.model.board");
    return _.union([_.clone(board)], linked);
  }.property("controllers.application.model.board.linkedRepos"),
  issueIsLinked: function(){
    return this.get("model.repo.full_name").toLowerCase() !== this.get("controllers.application.model.board.full_name").toLowerCase();
  }.property("controllers.application.model.board.full_name","model.repo", "model.repo.full_name"),
  colorIssue: function(issue){
    var linked_labels = this.get("controllers.application.model.board.link_labels");
    var label = _.find(linked_labels, function(l){
      var name = l.user + "/" + l.repo;
      return name.toLowerCase() === issue.repo.full_name.toLowerCase();
    });
    issue.color = label.color;
  },
  actions: {
    submit: function() {
      this.createIssue(this.get("order"));
    },
    assignRepo: function(repo){
      var board = this.findBoard(repo),
        get = Ember.get;

      // transfer assignee if possible
      this.set('model.assignee', get(board, 'assignees').findBy('login', this.get('model.assignee.login')));
      // transfer milestone if possible
      this.set('model.milestone', get(board, 'milestones').findBy('title', this.get('model.milestone.title')));

      var labels = get(board, 'other_labels'),
        selectedLabels = this.get('model.labels.length') ?
          this.get('model.labels') : [];
      var commonLabels = labels.filter(function(label){
        let name = get(label, 'name').toLowerCase();// jshint ignore:line
        return selectedLabels.any(function(selected){
          return get(selected,'name').toLowerCase() === name;
        });
      });
      this.set("model.labels", commonLabels);
    }
  }
});

export default IssuesCreateController;
