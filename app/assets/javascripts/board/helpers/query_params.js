var QueryParamsHelper = Ember.Object.create({
  repo: [],
  assignment: [],
  milestone: [],
  label: [],
  assignee: [],
  search: "",
  defaultParams: ["repo", "label", "assignee", "milestone", "assignment", "search"],
  stashedParams: {},

  syncQueryParams: function(controller, params){
    var params = params || this.get("defaultParams");
    var self = this;
    _.each(params, function(param){
      if (!self.get(param).length){
        self.set(param, controller.get(param));
      } else {
        controller.set(param, self.get(param));
      }
    })
  },

  stashQueryParams: function(controller, params){
    var params = params || this.get("defaultParams");
    var self = this;
    var saved = {};
    _.each(params, function(param){
      var value = self.determineParamValue(param);
      saved[param] = self.get(param);
      Ember.run.once(function(){
        self.set(param, value);
        controller.set(param, value);
      });
    });
    this.set("stashedParams", {controller: controller, params: saved});
  },

  restoreQueryParams: function(){
    saved = this.get("stashedParams");
    controller = saved["controller"];
    var self = this;
    _.each(saved["params"], function(param, key){
      self.set(key, param);
      controller.set(key, param);
    })
    this.set("stashedParams", {});
  },

  determineParamValue: function(param){
    var key = Object.prototype.toString.call(this.get(param));
    var keys = {
              "[object Array]": [],
              "[object String]": ""
             }
    return keys[key];
  }
});

module.exports = QueryParamsHelper;
