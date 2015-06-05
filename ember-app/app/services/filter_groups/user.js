import Ember from 'ember';

var UserFilters = Ember.Service.extend({

  create: function(){
    var filter = [];

    filter = [
      {
        name: "Unassigned issues",
        queryParam: "member",
        mode: 0,
        strategy: "inclusive",
        condition: function(i){
          return !i.assignee;
        }
      }
    ];

    if(App.get("loggedIn")){
      filter.push(
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
    }

    return filter
  }
});

export default UserFilters
