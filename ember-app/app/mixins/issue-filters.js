import Ember from 'ember';

var IssueFiltersMixin = Ember.Mixin.create({
  //Public Methods
  isDimmed: function(item){
    //False if item matches any active dimFilters
    var dim = !this.get("dimFilters").any(function(filter){
      return filter.condition(item);
    });
    return dim && this.get("dimFilters").length;
  },
  isHidden: function(item){
    //False if item matches any active hideFilters
    var hidden = !this.get("hideFilters").any(function(filter){
      return filter.condition(item);
    });
    return hidden && this.get("hideFilters").length;
  },

  //Properties
  dimFilters: function(){
    var filters = App.get("dimFilters");
    if(this.get("memberFilterDim")){
      filters = filters.concat([App.get("memberFilter")]);
    }
    return filters;
  }.property("App.dimFilters", "memberFilterDim"),
  hideFilters: function(){
    var filters = App.get("hideFilters");
    if(App.get("searchFilter")){
      filters = filters.concat([App.get("searchFilter")]);
    }
    if(this.get("memberFilterHidden")){
      filters = filters.concat([App.get("memberFilter")]);
    }
    return filters;
  }.property("App.hideFilters", "App.searchFilter", "memberFilterHidden"),

  //Private Methods
  memberFilterDim: function(){
    return App.get("memberFilter") && 
      App.get("memberFilter.mode") === 1;
  }.property("App.memberFilter"),
  memberFilterHidden: function(){
    return App.get("memberFilter") && 
      App.get("memberFilter.mode") === 2;
  }.property("App.memberFilter")
});

export default IssueFiltersMixin;
