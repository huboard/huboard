import Ember from 'ember';

var queryParamsService = Ember.Service.extend({
  filters: Ember.inject.service(),

  clear: function(){
    this.set("filterParams", []);
    this.set("filterParamsBuffer", []);
    this.set("searchParams", "");
    this.set("searchParamsBuffer", "");
  },

  //Filters
  filterParams: [],
  updateFilterParams: function(){
    var qps = this.get("filters.hideFilters").filter(function(f){
      return !f.search;
    }).map(function(f){ return f.name });
    this.set("filterParams", qps);
  }.observes("filters.hideFilters").on("init"),
  applyFilterParams: function(){
    var all_filters = this.get("filters.filterGroups.allFilters");
    this.get("filterParams").forEach(function(param){
      var filters = all_filters.filter(function(filter){
        return filter.name === param;
      })
      filters.setEach("mode", 2);
    });
  },
  filterParamsBuffer: [],
  updateFilterParamsBuffer: function(){
    if(this.get("filterParams").length){
      this.set("filterParamsBuffer", this.get("filterParams"));
    }
  }.observes("filterParams"),
  applyFilterBuffer: function(){
    var buffer = this.get("filterParamsBuffer");
    var params = this.get("filterParams");
    if(buffer.length && !params.length){
      this.set("filterParams", buffer);
      this.set("filterParamsBuffer", []);
    }
  },

  //Search
  searchParams: "",
  updateSearchParams: function(){
    var term = this.get("filters.filterGroups.search.term");
    this.set("searchParams", term);
  }.observes("filters.filterGroups.search.term").on("init"),
  applySearchParams: function(){
    var search = this.get("searchParams");
    if(search && search.length){
      this.set("filters.searchFilters.mode", 2); 
      this.set("filters.filterGroups.search.term", search);
    }
  },
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
