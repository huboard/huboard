var AssigneeController = Ember.ObjectController.extend({
  needs: ["index"],
  actions: {
    toggleShowMode: function(mode){
      this.set("showMode", mode);
    }
  },
  showMode: "less",
  assigneesBinding: "controllers.index.model.assignees",
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
  }.property("avatars")
});

module.exports = AssigneeController;
