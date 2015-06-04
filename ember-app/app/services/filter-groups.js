import Ember from 'ember';

var FilterGroups = Ember.Service.extend({

  hydrate: function(model){
    this.set("parentBoard", model);
    this.set("milestones", model.get("filterMilestones"));
    this.set("otherLabels", model.get("filterLabels"));
    this.set("linkLabels", model.get("link_labels"));
    this.createFilterGroups();
  },

  createFilterGroups: function(){
    if(App.get("loggedIn")){
      this.set("userFilters", [
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
        },
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
    }else{
      this.set("userFilters", [
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
    
    }
    this.set("milestoneFilters", this.get("milestones").map(function(m){
       return Ember.Object.create({
        name: m.title,
        queryParam: "milestone",
        mode:0,
        strategy: "inclusive",
        condition:function(i){
         return i.milestone && i.milestone.title.toLocaleLowerCase() === m.title.toLocaleLowerCase();
        }
       });
    }));
    this.get("milestoneFilters").insertAt(0, Ember.Object.create({
      name: 'No milestone',
      queryParam: "milestone",
      mode:0,
      strategy: "inclusive",
      condition:function(i){
        return i.milestone == null;
      }

    }));
    this.set("labelFilters", this.get("otherLabels").map(function(l){
       return Ember.Object.create({
        name: l.name,
        queryParam: "label",
        mode:0,
        color: l.color,
        strategy: "grouping",
        condition:function(i){
          return _.union(i.labels, i.other_labels).any(function(label){ 
             return l.name.toLocaleLowerCase() === label.name.toLocaleLowerCase();
          });
        }
       });
    }));
    var parentBoardOwner = this.get("parentBoard.full_name").split("/")[0];
    this.set("boardFilters", this.get("linkLabels").map(function(l){
       var name = parentBoardOwner === l.user ? l.repo : l.user + "/" + l.repo;
       return Ember.Object.create({
        name: name,
        queryParam: "repo",
        mode:0,
        color: l.color,
        strategy: "inclusive",
        condition:function(i){
          return i.repo.name === l.repo && i.repo.owner.login === l.user;
        }
       });
    }));
    this.get("boardFilters").insertAt(0, Ember.Object.create({
      name: App.get('repo.name'),
      queryParam: "repo",
      mode:0,
      color: "7965cc",
      strategy: "inclusive",
      condition:function(i){
        return i.repo.name === App.get('repo.name');
      }
    }));
  }
});

export default FilterGroups;
