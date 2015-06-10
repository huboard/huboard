import Ember from 'ember';

var UserFilters = Ember.Service.extend({
  filters: [],
  strategy: "inclusive",

  create: function(){
    this.set("filters", [
      {
        name: "Unassigned issues",
        queryParam: "member",
        mode: 0,
        condition: function(i){
          return !i.assignee;
        }
      }
    ]);

    if(App.get("loggedIn")){
      this.get("filters").insertAt(0, 
        {
          name: "Assigned to me",
          queryParam: "member",
          mode: 0,
          condition: function(i){
            return i.assignee && i.assignee.login === App.get("currentUser").login;
          }
      });
      this.get("filters").insertAt(1, 
        {
          name: "Assigned to others",
          queryParam: "member",
          mode: 0,
          condition: function(i){
            return i.assignee && i.assignee.login !== App.get("currentUser").login;
          }
      });
    };

    return this.get("filters");
  }
});

export default UserFilters
