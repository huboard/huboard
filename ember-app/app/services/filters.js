import Ember from 'ember';

var FiltersService = Ember.Service.extend({
  filterGroups: Ember.inject.service(),

  milestonesBinding: "filterGroups.milestones",
  otherLabelsBinding: "filterGroups.otherLabels",
  linkLabelsBinding: "filterGroups.linkLabels",

  allFilters: function(){
      return this.get("filterGroups.milestoneFilters")
              .concat(this.get("filterGroups.userFilters"))
              .concat(this.get("filterGroups.boardFilters"))
              .concat(this.get("filterGroups.labelFilters"));
  }.property("filterGroups.milestoneFilters.@each.mode", "filterGroups.userFilters.@each.mode","filterGroups.labelFilters.@each.mode", "filterGroups.boardFilters.@each.mode"),
  dimFiltersChanged: function(){
    var self = this;
    Ember.run.once(function(){
      var allFilters = self.get("allFilters");

      this.set("dimFilters", allFilters.filter(function(f){
        return f.mode === 1;
      }));

      this.set("hideFilters", allFilters.filter(function(f){
        return f.mode === 2;
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
        self.get("allFilters").forEach(function(f){
          Ember.set(f,"mode",0);
        });
      });
    }
  },

  //forceDimsToActive: function(){
  //  if (this.get("anyFiltersActive") && this.get("anyFiltersDim")){
  //    this.setDimFiltersToActive();
  //    this.setMemberFilterToActive();
  //  }
  //}.observes("anyFiltersActive", "anyFiltersDim", "App.hideFilters.[]", "App.searchFilter", "App.memberFilter"),
  //anyFiltersActive: function(){
  //  return App.get("hideFilters.length") ||
  //    App.get("searchFilter") ||
  //    (App.get("memberFilter") &&
  //     App.get("memberFilter.mode") === 2);
  //}.property("App.hideFilters", "App.searchFilter", "App.memberFilter"),
  //anyFiltersDim: function(){
  //  var member_filter = App.get("memberFilter");
  //  return App.get("dimFilters") || 
  //    (member_filter && member_filter.get("mode") === 1);
  //}.property("App.dimFilters", "App.memberFilter"),
  //setDimFiltersToActive: function(){
  //  if (App.get("dimFilters")){
  //    App.get("dimFilters").forEach(function(f){
  //      Ember.set(f, "mode", 2);
  //    });
  //  }
  //},
  //setMemberFilterToActive: function(){
  //  var member_filter = App.get("memberFilter");
  //  var controller = this.get("controllers.assignee");
  //  if(member_filter && App.get("memberFilter.mode") === 1){
  //    controller.set("lastClicked.mode", 2);
  //    var login = controller.get("lastClicked.content.avatar.login");
  //    var formattedLogin = login.replace(/\s+/g, '');
  //    this.get("member").pushObject(formattedLogin);
  //  }
  //},
  
  //Returns Concated filters list for card wrapper view
  dimFiltersUnion: function(){
    var filters = App.get("dimFilters");
    if(this.get("memberFilterDim")){
      filters = filters.concat([App.get("memberFilter")]);
    }
    return filters;
  }.property("dimFilters", "memberFilterDim"),
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

export default FiltersService;
