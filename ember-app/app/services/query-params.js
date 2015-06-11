import Ember from 'ember';

var queryParamsService = Ember.Service.extend({
  filters: Ember.inject.service(),

  clear: function(){
    this.set("filterParams", []);
    this.set("filterParamsBuffer", []);
  },

  filterParams: [],
  updateFilterParams: function(){
    var qps = this.get("filters.hideFilters").map(function(f){
      return f.name;
    });
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
  }

});

export default queryParamsService;
