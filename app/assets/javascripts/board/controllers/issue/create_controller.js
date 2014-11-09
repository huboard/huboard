var IssuesCreateController = Ember.ObjectController.extend({
  needs: ["application"],
  actions: {
    submit: function() {
      this.createIssue(this.get("order"));
    }
  },
  isCollaboratorBinding: "App.repo.is_collaborator",
  otherLabels: function(){
    return Ember.copy(this.get("controllers.application.model.board.other_labels"));
  }.property("model","controllers.application.model.board.other_labels"),
  milestonesBinding: "controllers.application.model.board.milestones",
  assigneesBinding: "controllers.application.model.board.assignees",
  columnsBinding: "controllers.application.model.board.columns",
  disabled: function () {
      return this.get("processing") || !this.get("isValid");
  }.property("processing","isValid"),
  isValid: function () {
    return this.get("model.title");
  }.property("model.title"),
  mentions: function(){
    return _.uniq(_.compact(this.get('controllers.application.model.board.assignees')), function(i){
      return i.login 
    });
  }.property('controllers.application.model.board.assignees'),
  order: {},
  createIssue: function(order){
    var controller = this;
    this.set("processing",true)
    this.get("model").saveNew(order).then(function(issue){
       controller.send("issueCreated", issue)
       controller.set("processing",false)
    });
  }
});

module.exports = IssuesCreateController;

