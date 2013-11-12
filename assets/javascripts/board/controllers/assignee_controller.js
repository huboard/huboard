var AssigneeController = Ember.ObjectController.extend({
  needs: ["index"],
  actions: {
    toggleShowMode: function(mode){
      this.set("showMode", mode);
    },
    filterBy: function (user) {
    
    }
  },
  showMode: "less",
  assigneesBinding: "controllers.index.model.assignees",
  memberFilter: "App.memberFilter",
  lastClicked: null,
  filterChanged : function(){
    debugger;
  }.observes("lastClicked"),
  displayShowMore: function(){
    return this.get("assignees").length > 25;
  },
  shouldShowMore: function () {
    return this.get("showMode") === "more";
  }.property("showMode"),
  avatars : function () {
    switch (this.get("showMode")){
      case "less":
        return _.take(this.get("assignees"), 25)
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
  }.property("avatars")
});

module.exports = AssigneeController;
