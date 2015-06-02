import Ember from 'ember';

var IssueFiltersMixin = Ember.Mixin.create({
  //Public Methods
  isDimmed: function(item){
    return this.filter(this.get("dimFilters"), item);
  },
  isHidden: function(item){
    return this.filter(this.get("hideFilters"), item);
  },

  //Filtering Strategies
  filter: function(filters, item){
    var grouping = this.filterByStrategy(filters, "grouping");
    var inclusive = this.filterByStrategy(filters, "inclusive");

    var hide_ands = this.groupingStrategy(grouping, item);
    var hide_ors = this.inclusiveStrategy(inclusive, item);

    if(hide_ands && filters.length){ return hide_ands }
    if(hide_ors && filters.length){ return hide_ors }
    return false;
  },
  filterByStrategy: function(filters, strategy){
    return filters.filter(function(f){
      return f.strategy === strategy
    });
  },

  ////ANDS (item must must all of the filters)
  groupingStrategy: function(filters, item){
    return filters.any(function(filter){
      return !filter.condition(item);
    });
  },
  ////ORS (item must match any of the filters)
  inclusiveStrategy: function(filters, item){
    return !filters.any(function(filter){
      return filter.condition(item);
    });
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
