var IssuesCreateController = require("./create_controller.js");

var IssuesQuickCreateController = IssuesCreateController.extend({
  quickTitle: '',

  init: function(){
    this.set('model', this.get('model').createNew());
  },

  actions: {
    onQuickAdd: function(){
      this.set('model.title', this.get('quickTitle'));
      this.createNewIssue();
      this.set('quickTitle', '');
    },
  },
});

module.exports = IssuesQuickCreateController;
