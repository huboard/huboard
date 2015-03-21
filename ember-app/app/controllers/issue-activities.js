import Ember from 'ember';

var IssueActivitiesController = Ember.ArrayController.extend({
  sortProperties: ["created_at"],
  itemController: "issueActivity"

})

export default IssueActivitiesController;
