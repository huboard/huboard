import Ember from 'ember';

var IssueActivitiesController = Ember.ArrayController.extend({
  sortProperties: ["created_at"],
  itemController: "issue/activity"

});

export default IssueActivitiesController;
