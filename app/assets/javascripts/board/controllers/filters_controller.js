var FiltersController = Ember.ObjectController.extend({
  needs: ["application"],
  milestonesBinding: "controllers.application.model.board.filterMilestones",
  otherLabelsBinding: "controllers.application.model.board.filterLabels",
  linkLabelsBinding: "controllers.application.model.board.link_labels",
  lastUserFilterClicked: null,
  lastUserFilterClickedChanged: function(){
    Ember.run.once(function(){
      var self = this;
      this.get("userFilters").filter(function(f){
        return f.name != self.get("lastUserFilterClicked");
      }).forEach(function(f){
        Ember.set(f,"mode", 0);
      })
    }.bind(this))
  }.observes("lastUserFilterClicked"),
  userFilters: null,
  milestoneFilters: null,
  linkFilters: null,
  lastLinkFilterClickedChanged: function(){
    Ember.run.once(function(){
      var self = this;
      this.get("linkFilters").filter(function(f){
        return f.name != self.get("lastLinkFilterClicked");
      }).forEach(function(f){
        Ember.set(f,"mode", 0);
      })
    }.bind(this))
  }.observes("lastLinkFilterClicked"),
  lastMilestoneFilterClickedChanged: function(){
    Ember.run.once(function(){
      var self = this;
      this.get("milestoneFilters").filter(function(f){
        return f.name != self.get("lastMilestoneFilterClicked");
      }).forEach(function(f){
        Ember.set(f,"mode", 0);
      })
    }.bind(this))
  }.observes("lastMilestoneFilterClicked"),
  init: function(){
    if(App.get("loggedIn")){
      this.set("userFilters", [
        {
          name: "Assigned to me",
          mode: 0,
          condition: function(i){
            return i.assignee && i.assignee.login === App.get("currentUser").login;
          }
        },

        {
          name: "Assigned to others",
          mode: 0,
          condition: function(i){
            return i.assignee && i.assignee.login !== App.get("currentUser").login;
          }
        },
        {
          name: "Unassigned issues",
          mode: 0,
          condition: function(i){
            return !i.assignee;
          }
        }
      ]);
    
    }else{
      this.set("userFilters", [
        {
          name: "Unassigned issues",
          mode: 0,
          condition: function(i){
            return !i.assignee;
          }
        }
      ]);
    
    }
    this.set("milestoneFilters", this.get("milestones").map(function(m){
       return Ember.Object.create({
        name: m.title,
        mode:0,
        condition:function(i){
         return i.milestone && i.milestone.title.toLocaleLowerCase() === m.title.toLocaleLowerCase();
        }
       })
    }));
    this.get("milestoneFilters").insertAt(0, Ember.Object.create({
      name: 'No milestone',
      mode:0,
      condition:function(i){
        return i.milestone == null;
      }

    }));
    this.set("labelFilters", this.get("otherLabels").map(function(l){
       return Ember.Object.create({
        name: l.name,
        mode:0,
        color: l.color,
        condition:function(i){
          return _.union(i.labels, i.other_labels).any(function(label){ 
             return l.name.toLocaleLowerCase() === label.name.toLocaleLowerCase();
          });
        }
       })
    }));
    var parentBoardOwner = this.get("controllers.application.model.board.full_name").split("/")[0];
    this.set("linkFilters", this.get("linkLabels").map(function(l){
       var name = parentBoardOwner == l.user ? l.repo : l.user + "/" + l.repo;
       return Ember.Object.create({
        name: name,
        mode:0,
        color: l.color,
        condition:function(i){
          return i.repo.name == l.repo && i.repo.owner.login == l.user;
        }
       })
    }));
  },
  lastMilestoneFilterClicked: null,
  lastLabelFilterClicked: null,
  lastLinkFilterClicked: null,
  dimFiltersChanged: function(){
    Ember.run.once(function(){
      var allFilters = this.get("milestoneFilters")
                          .concat(this.get("userFilters"))
                          .concat(this.get("linkFilters"))
                          .concat(this.get("labelFilters"));

      this.set("dimFilters", allFilters.filter(function(f){
        return f.mode == 1;
      }));

      this.set("hideFilters", allFilters.filter(function(f){
        return f.mode == 2;
      }));
    }.bind(this))
  }.observes("milestoneFilters.@each.mode", "userFilters.@each.mode","labelFilters.@each.mode", "linkFilters.@each.mode"),
  dimFiltersBinding: "App.dimFilters",
  hideFiltersBinding: "App.hideFilters"
  
});

module.exports = FiltersController;
