var IssueActivitiesController = Ember.ArrayController.extend({
  sortProperties: ["created_at"],
  itemController: "issueActivity"

})

module.exports = IssueActivitiesController;
