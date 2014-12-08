var QueryParamsHelper = Ember.Object.create({
  repo: [],
  assignment: [],
  milestone: [],
  label: [],
  assignee: [],
  search: "",

  syncQueryParams: function(controller){
    var params = ["repo", "label", "assignee", "milestone", "assignment", "search"]  
    var self = this;
    _.each(params, function(param){
      if (!self.get(param).length){
        self.set(param, controller.get(param));
      } else {
        controller.set(param, self.get(param));
      }
    })
  }
});

module.exports = QueryParamsHelper;
