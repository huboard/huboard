import Ember from 'ember';

var FiltersController = Ember.ObjectController.extend({
  needs: ["application", "assignee"],

  queryParamsBinding: "controllers.application.queryParams",
  repoBinding: "controllers.application.repo",
  memberBinding: "controllers.application.member",
  milestoneBinding: "controllers.application.milestone",
  labelBinding: "controllers.application.label",

  milestonesBinding: "controllers.application.model.board.filterMilestones",
  otherLabelsBinding: "controllers.application.model.board.filterLabels",
  linkLabelsBinding: "controllers.application.model.board.link_labels",

  userFilters: null,
  milestoneFilters: null,
  boardFilters: null,

  init: function(){
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
          },
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
    var parentBoardOwner = this.get("controllers.application.model.board.full_name").split("/")[0];
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
        },
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
      },
    }));
  },
  allFilters: function(){
      return this.get("milestoneFilters")
              .concat(this.get("userFilters"))
              .concat(this.get("boardFilters"))
              .concat(this.get("labelFilters"));
  }.property("milestoneFilters.@each.mode", "userFilters.@each.mode","labelFilters.@each.mode", "boardFilters.@each.mode"),
  allFiltersChanged: function(){
    var self = this;
    Ember.run.once(function(){
      var allFilters = self.get("allFilters");

      this.set("dimFilters", allFilters.filter(function(f){
        return f.mode === 1;
      }));

      this.set("hideFilters", allFilters.filter(function(f){
        var formattedParam = f.name.replace(/\s+/g, '');
        var isQueryParamFiltered = self.get(f.queryParam).contains(formattedParam);
        return f.mode === 2 || isQueryParamFiltered;
      }));
    }.bind(this));

  }.observes("allFilters").on("init"),
  dimFiltersBinding: "App.dimFilters",
  hideFiltersBinding: "App.hideFilters",
  filtersActive: function(){
    var allFilters = this.get("allFilters");
    var active =  _.any(allFilters, function(f){
      return f.mode > 0;
    });
    return active;
  }.property("allFilters"),
  membersActive: false,
  actions: {
    clearFilters: function(){
      var self = this;
      Ember.run.once(function(){
        var params = ["repo", "member", "milestone", "label"];
        _.each(params, function(p){ self.get(p).clear(); });
        self.get("allFilters").forEach(function(f){
          Ember.set(f,"mode",0);
        });
      });
    }
  },

  forceDimsToActive: function(){
    if (this.get("anyFiltersActive") && this.get("anyFiltersDim")){
      this.setDimFiltersToActive();
      this.setMemberFilterToActive();
    }
  }.observes("anyFiltersActive", "anyFiltersDim", "App.hideFilters.[]", "App.searchFilter", "App.memberFilter"),
  anyFiltersActive: function(){
    return App.get("hideFilters.length") ||
      App.get("searchFilter") ||
      (App.get("memberFilter") &&
       App.get("memberFilter.mode") === 2);
  }.property("App.hideFilters", "App.searchFilter", "App.memberFilter"),
  anyFiltersDim: function(){
    var member_filter = App.get("memberFilter");
    return App.get("dimFilters") || 
      (member_filter && member_filter.get("mode") === 1);
  }.property("App.dimFilters", "App.memberFilter"),
  setDimFiltersToActive: function(){
    var self = this;
    if (App.get("dimFilters")){
      App.get("dimFilters").forEach(function(f){
        var formattedParam = f.name.replace(/\s+/g, '');
        if (!self.get(f.queryParam).contains(formattedParam)){
          self.get(f.queryParam).pushObject(formattedParam);
        }
        Ember.set(f, "mode", 2);
      });
    }
  },
  setMemberFilterToActive: function(){
    var member_filter = App.get("memberFilter");
    var controller = this.get("controllers.assignee");
    if(member_filter && App.get("memberFilter.mode") === 1){
      controller.set("lastClicked.mode", 2);
      var login = controller.get("lastClicked.content.avatar.login");
      var formattedLogin = login.replace(/\s+/g, '');
      if (!this.get("member").contains(formattedLogin)){
        this.get("member").pushObject(formattedLogin);
      }
    }
  },


  //Returns Concated filters list for card wrapper view
  dimFiltersUnion: function(){
    var filters = App.get("dimFilters");
    if(this.get("memberFilterDim")){
      filters = filters.concat([App.get("memberFilter")]);
    }
    return filters;
  }.property("App.dimFilters", "memberFilterDim"),
  hideFiltersUnion: function(){
    var filters = App.get("hideFilters");
    if(App.get("searchFilter")){
      filters = filters.concat([App.get("searchFilter")]);
    }
    if(this.get("memberFilterHidden")){
      filters = filters.concat([App.get("memberFilter")]);
    }
    return filters;
  }.property("App.hideFilters", "App.searchFilter", "memberFilterHidden"),

  memberFilterDim: function(){
    return App.get("memberFilter") && 
      App.get("memberFilter.mode") === 1;
  }.property("App.memberFilter"),
  memberFilterHidden: function(){
    return App.get("memberFilter") && 
      App.get("memberFilter.mode") === 2;
  }.property("App.memberFilter")
});

export default FiltersController;
