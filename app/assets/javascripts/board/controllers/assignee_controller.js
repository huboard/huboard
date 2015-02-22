var AssigneeController = Ember.ObjectController.extend({
  needs: ["application"],
  actions: {
    toggleShowMode: function(mode){
      this.set("showMode", mode);
    },
    clearFilters: function(){
      var self = this;
      Ember.run.once(function(){
        var params = ["assignee"];
        _.each(params, function(p){ self.get(p).clear(); });
        var allFilters = self.get("filters");
        var active =  _.each(allFilters, function(f){
          Ember.set(f,"mode",0);
        });
      });
    }
  },
  showMode: "less",
  assigneesBinding: "controllers.application.model.board.assignees",
  assigneeBinding: "controllers.application.assignee",
  memberFilterBinding: "App.memberFilter",
  lastClicked: null,
  filterChanged : function(){
    Ember.run.once(function(){
      var filter = this.get("lastClicked").get("content");
      this.set("memberFilter", {
        mode: this.get("lastClicked.mode"),
        condition: this.get("lastClicked.content.condition")
      })
    }.bind(this))
  }.observes("lastClicked.mode"),
  displayShowMore: function(){
    return this.get("assignees").length > 24;
  }.property(),
  shouldShowMore: function () {
    return this.get("showMode") === "more";
  }.property("showMode"),
  avatars : function () {
    switch (this.get("showMode")){
      case "less":
        return _.take(this.get("assignees"), 24)
        break;
      case "more":
        return this.get("assignees");
        break;
    }
  }.property("showMode"),
  filters : function () {
     return this.get("avatars").map(function(a){
         return Ember.Object.create({
           avatar : a,
           mode: 0,
           condition: function (i) {
              return i.assignee && i.assignee.login === a.login;
           }
         })
     });
  }.property("avatars"),
  filtersActive: function(){
   return this.get("filters").any(function(f){
      return Ember.get(f, "mode") !== 0;
    });
  }.property("filters.@each.mode"),
});

module.exports = AssigneeController;
