var FiltersController = Ember.ObjectController.extend({
  needs: ["application", "index"],

  queryParamsBinding: "controllers.application.queryParams",
  repoqpBinding: "controllers.application.repoqp",
  assigneeqpBinding: "controllers.application.assigneeqp",
  milestoneqpBinding: "controllers.application.milestoneqp",
  labelqpBinding: "controllers.application.labelqp",

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
  boardFilters: null,
  lastBoardFilterClickedChanged: function(){
    Ember.run.once(function(){
      var self = this;
      this.get("boardFilters").filter(function(f){
        return f.name != self.get("lastBoardFilterClicked");
      }).forEach(function(f){
        Ember.set(f,"mode", 0);
      })
    }.bind(this))
  }.observes("lastBoardFilterClicked"),
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
    var self = this;
    if(App.get("loggedIn")){
      this.set("userFilters", [
        {
          name: "Assigned to me",
          queryParam: "assigneeqp",
          mode: 0,
          condition: function(i){
            return i.assignee && i.assignee.login === App.get("currentUser").login;
          }
        },

        {
          name: "Assigned to others",
          queryParam: "assigneeqp",
          mode: 0,
          condition: function(i){
            return i.assignee && i.assignee.login// !== App.get("currentUser").login;
          }
        },
        {
          name: "Unassigned issues",
          queryParam: "assigneeqp",
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
          queryParam: "assigneeqp",
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
        queryParam: "milestoneqp",
        mode:0,
        condition:function(i){
         return i.milestone && i.milestone.title.toLocaleLowerCase() === m.title.toLocaleLowerCase();
        }
       })
    }));
    this.get("milestoneFilters").insertAt(0, Ember.Object.create({
      name: 'No milestone',
      queryParam: "milestoneqp",
      mode:0,
      condition:function(i){
        return i.milestone == null;
      }

    }));
    this.set("labelFilters", this.get("otherLabels").map(function(l){
       return Ember.Object.create({
        name: l.name,
        queryParam: "labelqp",
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
    this.set("boardFilters", this.get("linkLabels").map(function(l){
       var name = parentBoardOwner == l.user ? l.repo : l.user + "/" + l.repo;
       return Ember.Object.create({
        name: name,
        queryParam: "repoqp",
        mode:0,
        color: l.color,
        condition:function(i){
          return i.repo.name == l.repo && i.repo.owner.login == l.user;
        }
       })
    }));
    this.get("boardFilters").insertAt(0, Ember.Object.create({
      name: App.get('repo.name'),
      queryParam: "repoqp",
      mode:0,
      condition:function(i){
        return i.repo.name == App.get('repo.name');
      }
    }));
  },
  lastMilestoneFilterClicked: null,
  lastLabelFilterClicked: null,
  lastBoardFilterClicked: null,
  applyFilters: function(){
    Ember.run.once(function(){
      var self = this;
      var allFilters = this.get("milestoneFilters")
                          .concat(this.get("userFilters"))
                          .concat(this.get("boardFilters"))
                          .concat(this.get("labelFilters"));

      this.set("dimFilters", allFilters.filter(function(f){
        return f.mode == 1;
      }));

      this.set("hideFilters", allFilters.filter(function(f){
        var formattedParam = f.name.replace(/\s+/g, '');
        var isQueryParamFiltered = self.get(f.queryParam).contains(formattedParam);
        return f.mode == 2 || isQueryParamFiltered;
      }));
  }.bind(this))}.on('init'),
  dimFiltersChanged: function(){
    this.applyFilters();
  }.observes("milestoneFilters.@each.mode", "userFilters.@each.mode","labelFilters.@each.mode", "boardFilters.@each.mode"),
  dimFiltersBinding: "App.dimFilters",
  hideFiltersBinding: "App.hideFilters"
  
});

module.exports = FiltersController;
