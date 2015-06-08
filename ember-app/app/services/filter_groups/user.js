import Ember from 'ember';

var UserFilters = Ember.Service.extend({
  filters: [],
  create: function(){
    this.set("filters", [
      {
        name: "Unassigned issues",
        queryParam: "member",
        mode: 0,
        strategy: "inclusive",
        condition: function(i){
          return !i.assignee;
        }
      }
    ]);

    if(App.get("loggedIn")){
      this.get("filters").pushObject(
        {
          name: "Assigned to me",
          queryParam: "member",
          mode: 0,
          strategy: "inclusive",
          condition: function(i){
            return i.assignee && i.assignee.login === App.get("currentUser").login;
          }
        },
        {
          name: "Assigned to others",
          queryParam: "member",
          mode: 0,
          strategy: "inclusive",
          condition: function(i){
            return i.assignee && i.assignee.login !== App.get("currentUser").login;
          }
        }
      );
    };

    return this.get("filters");
  }
});

export default UserFilters
