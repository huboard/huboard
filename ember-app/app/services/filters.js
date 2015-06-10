import Ember from 'ember';

var FiltersService = Ember.Service.extend({
  filterGroups: Ember.inject.service(),

  anyFiltersChanged: function(){
    Ember.run.once(function(){
      var allFilters = this.get("filterGroups.allFilters");

      this.set("dimFilters", allFilters.filter(function(f){
        return f.mode === 1;
      }));

      this.set("hideFilters", allFilters.filter(function(f){
        return f.mode === 2;
      }));
    }.bind(this));
  }.observes("filterGroups.allFilters").on("init"),

  clear: function(){
    this.get("filterGroups.allFilters").setEach("mode", 0);
  },

  //Make computed filters available via the FiltersService
  unknownProperty: function(key){
    if (!this.get("filterGroups.filterGroupsCreated")){ return; }
    key = key.replace("Filters", "");
    if (this.get("filterGroups." + key + ".filters")){
      return this.get("filterGroups." + key + ".filters");
    }
  },

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

  //Returns Concated filters list for card-wrapper & column count
  hideFiltersUnion: function(){
    var filters = this.get("hideFilters");
    if(App.get("searchFilter")){
      filters = filters.concat([App.get("searchFilter")]);
    }
    return filters;
  }.property("hideFilters", "App.searchFilter"),
});

export default FiltersService;
