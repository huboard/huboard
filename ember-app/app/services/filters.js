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
  hideFiltersUnion: function(){
    var filters = this.get("hideFilters");
    if(App.get("searchFilter")){
      filters = filters.concat([App.get("searchFilter")]);
    }
    return filters;
  }.property("hideFilters", "App.searchFilter"),
});

export default FiltersService;
