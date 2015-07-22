import Ember from 'ember';

var queryParamsService = Ember.Service.extend({
  filters: Ember.inject.service(),

  clear: function(){
    var self = this;
    var params = ["repo", "assignee", "milestone", "label"];
    params.forEach(function(param){
      return self.set(`${param}Params`, []);
    });
    this.set("filterParamsBuffer", {});
    this.set("searchParams", "");
    this.set("searchParamsBuffer", "");
  },

  ////Query Params for Filters
  repoParams: [],
  assigneeParams: [],
  milestoneParams: [],
  labelParams: [],
  filterNames: ["repo", "assignee", "milestone", "label"],
  allFilterParams: function(){
    var self = this;
    var filters = this.get("filterNames").map(function(param){
      return self.get(`${param}Params`);
    });
    return _.flatten(filters);
  }.property("{repo,assignee,milestone,label}Params.[]"),

  //Push board, label and milestone filters to the URL
  updateFilterParams: function(){
    if(!this.get("filters.filterGroups.created")){return;}
    var self = this;
    var filters_object = this.get("filters.allFiltersObject");
    ["board", "label", "milestone"].forEach(function(param){
      var hidden_filters = filters_object[param].filter(function(f){
        return f.mode === 2;
      }).map(function(f){return f.name; });
      param = param === "board" ? "repo" : param;
      self.set(`${param}Params`, hidden_filters);
    });
  }.observes("filters.hideFilters").on("init"),

  //Push user and member filters to the URL
  updateAssigneeParams: function(){
    if(!this.get("filters.filterGroups.created")){return;}
    var filters = this.get("filters.userFilters").
      concat(this.get("filters.memberFilters"));
    var hidden_filters = filters.filter(function(f){
      return f.mode === 2;
    }).map(function(f){return f.name; });
    this.set("assigneeParams", hidden_filters);
  }.observes("filters.hideFilters").on("init"),

  //Pushes URL filters down to the filter objects
  applyFilterParams: function(){
    var legacyMatch = this.legacyFilterMatch;
    var all_filters = this.get("filters.filterGroups.allFilters");
    this.get("allFilterParams").forEach(function(param){
      var filters = all_filters.filter(function(filter){
        return filter.name === param || legacyMatch(filter.name) === param;
      });
      filters.setEach("mode", 2);
    });
  },

  //Buffer the Filter Params for transitions (controllers initialization wipes them)
  filterParamsBuffer: {},
  updateFilterParamsBuffer: function(){
    this.set("filterParamsBuffer", {
      active: true,
      repo: this.get("repoParams"),
      assignee: this.get("assigneeParams"),
      milestone: this.get("milestoneParams"),
      label: this.get("labelParams")
    });
  }.observes("allFilterParams.length"),
  applyFilterBuffer: function(){
    var buffer = this.get("filterParamsBuffer");
    var params = this.get("allFilterParams");
    if(buffer.active && !params.length){
      this.set("repoParams", buffer.repo);
      this.set("assigneeParams", buffer.assignee);
      this.set("milestoneParams", buffer.milestone);
      this.set("labelParams", buffer.label);
      this.set("filterParamsBuffer", {});
    }
  },
  legacyFilterMatch: function(name){
    if(!name){ return false; }
    return name.replace(/\s+/g, '');
  },

  ////Query Params for Search
  searchParams: "",

  //Push search terms to the URL
  updateSearchParams: function(){
    var term = this.get("filters.filterGroups.search.term");
    this.set("searchParams", term);
  }.observes("filters.filterGroups.search.term").on("init"),

  //Pushes URL search term down to the search filter 
  applySearchParams: function(){
    var search = this.get("searchParams");
    if(search && search.length){
      this.set("filters.searchFilters.mode", 2); 
      this.set("filters.filterGroups.search.term", search);
    }
  },

  //Buffer the search term for transitions (controllers initialization wipes them)
  searchParamsBuffer: "",
  updateSearchParamsBuffer: function(){
    var search = this.get("searchParams");
    if(search && search.length){
      this.set("searchParamsBuffer", this.get("searchParams"));
    }
  }.observes("searchParams"),
  applySearchBuffer: function(){
    var buffer = this.get("searchParamsBuffer");
    var term = this.get("searchParams");
    if(buffer.length && !term.length){
      this.set("searchParams", buffer);
      this.set("searchParamsBuffer", "");
    }
  }
});

export default queryParamsService;
