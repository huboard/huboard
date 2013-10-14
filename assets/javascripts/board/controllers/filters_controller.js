var FiltersController = Ember.ObjectController.extend({
  lastUserFilterClicked: null,
  lastUserFilterClickedChanged: function(){
    var self = this;
    this.get("userFilters").filter(function(f){
      return f.name != self.get("lastUserFilterClicked");
    }).forEach(function(f){
      Ember.set(f,"mode", 0);
    })
  }.observes("lastUserFilterClicked"),
  userFilters: [
    {
      name: "Assigned to me",
      mode: 0,
      condition: function(){}
    },

    {
      name: "Assigned to others",
      mode: 0,
      condition: function(){}
    },
    {
      name: "Unassigned issues",
      mode: 0,
      condition: function(){}
    }
  ],
  
});

module.exports = FiltersController;
