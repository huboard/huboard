import Ember from "ember";

var FiltersService = Ember.Service.extend({
  //filterGroups requires setGroups(model) before it yields
  //anything meaningful to the FiltersService
  filterGroups: Ember.inject.service(),
  qps: Ember.inject.service("query-params"),

  //Make computed filters available via the FiltersService
  unknownProperty: function(key){
    if (!this.get("filterGroups.created")){ return; }
    key = key.replace("Filters", "");
    if (this.get("filterGroups." + key + ".filters")){
      return this.get("filterGroups." + key + ".filters");
    }
  },

  //Set hideFilters so it is observable on init
  hideFilters: [],
  dimFilters: [],

  clear: function(){
    this.get("filterGroups.allFilters").setEach("mode", 0);
    this.set("filterGroups.search.term", "");
    this.get("qps").clear();
  },

  anyFiltersChanged: function(){
    var self = this;
    Ember.run.once(function(){
      var allFilters = self.get("filterGroups.allFilters");

      self.set("dimFilters", allFilters.filter(function(f){
        return f.mode === 1;
      }));

      self.set("hideFilters", allFilters.filter(function(f){
        return f.mode === 2;
      }));
    });
  }.observes("filterGroups.allFilters.[]"),

  ////allFilters as an Object i.e
  // {
  //   board: [],
  //   labels: [],
  //   member: []
  // }
  //
  allFiltersObject: function(){
    var self = this;
    var all_filters = {};
    this.get("filterGroups.groups").forEach(function(group){
      all_filters[group] = self.get(`filterGroups.${group}.filters`);
    });
    return all_filters;
  }.property("filterGroups.allFilters"),

  //// Filter Groups based on their strategy, sub-filtered by mode i.e
  // {
  //   grouping: {
  //     labels: []
  //   },
  //   inclusive: {
  //     member: [],
  //     board: []
  //   }
  // }
  //
  hiddenFiltersObject: function(){
    var self = this;
    var groups = {};
    this.get("filterGroups.groups").forEach(function(group){
      var filters = self.get(`filterGroups.${group}.filters`);
      var strategy = self.get(`filterGroups.${group}.strategy`); 
      if(!groups[strategy]){ groups[strategy] = {}; }
      groups[strategy][group] = filters.filter(function(f){
        return f.mode === 2;
      });
    });
    return groups;
  }.property("hideFilters"),
  dimFiltersObject: function(){
    var self = this;
    var groups = {};
    this.get("filterGroups.groups").forEach(function(group){
      var filters = self.get(`filterGroups.${group}.filters`);
      var strategy = self.get(`filterGroups.${group}.strategy`); 
      if(!groups[strategy]){ groups[strategy] = {}; }
      groups[strategy][group] = filters.filter(function(f){
        return f.mode === 1;
      });
    });
    return groups;
  }.property("dimFilters"),

  //Forces Dim filter groups to active if there are other actives present
  //within that same group
  forceMembersOrUsersToActive: function(){
    var member_active = this.groupActive(this.get("memberFilters"));
    var user_active = this.groupActive(this.get("userFilters"));
    if(member_active || user_active){
      this.get("userFilters").concat(this.get("memberFilters"))
        .forEach(function(f){
          if (f.mode === 1){ Ember.set(f, "mode", 2); }
        });
    }
  }.observes("filterGroups.{member,user}.filters.@each.mode"),
  forceLabelsToActive: function(){
    if(this.groupActive(this.get("labelFilters"))){
      this.get("labelFilters").forEach(function(f){
        if (f.mode === 1){ Ember.set(f, "mode", 2); }
      });
    }
  }.observes("filterGroups.label.filters.@each.mode"),
  forceBoardsToActive: function(){
    if(this.groupActive(this.get("boardFilters"))){
      this.get("boardFilters").forEach(function(f){
        if (f.mode === 1){ Ember.set(f, "mode", 2); }
      });
    }
  }.observes("filterGroups.board.filters.@each.mode"),
  forceMilestonesToActive: function(){
    if(this.groupActive(this.get("milestoneFilters"))){
      this.get("milestoneFilters").forEach(function(f){
        if (f.mode === 1){ Ember.set(f, "mode", 2); }
      });
    }
  }.observes("filterGroups.milestone.filters.@each.mode"),
  groupActive: function(filters){
    if (!filters || !filters.length){ return false;}
    return filters.any(function(f){
      return f.mode === 2;
    });
  },
});

export default FiltersService;
