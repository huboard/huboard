import Ember from 'ember';

var IssueFiltersMixin = Ember.Mixin.create({
  filters: Ember.inject.service(),

  //Public Methods
  isHidden: function(item){
    var filters = this.filtersByMode(2);
    if(App.get("searchFilter")){
      filters = filters.concat([App.get("searchFilter")]);
    }
    return this.filter(filters, item);
  },
  isDim: function(item){
    var filters = this.filtersByMode(1);
    return this.filter(filters, item);
  },

  filter: function(filter_groups, item){
    var inclusive_matches = this.runFilters(item, filter_groups, "inclusive");
    var grouping_matches = this.runFilters(item, filter_groups, "grouping");

    if(grouping_matches || inclusive_matches){ return true }
    return false;
  },

  //Private Methods

  //// Arrange Filters into Groups based on their strategy, sub-filtered by mode
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
  filtersByMode: function(mode){
    var self = this;
    var groups = {};
    this.get("filters.filterGroups.groups").forEach(function(group){
      var filters = self.get(`filters.filterGroups.${group}.filters`);
      var strategy = self.get(`filters.filterGroups.${group}.strategy`); 
      if(!groups[strategy]){ groups[strategy] = {}; }
      groups[strategy][group] = filters.filter(function(f){
        return f.mode === mode;
      });
    });
    return groups;
  },

  runFilters: function(item, filter_groups, strategy){
    var results = [];
    var filters_active = [];
    var strategy_function = this[`${strategy}Strategy`];

    this.mergeUserAndMemberGroups(filter_groups, strategy);

    _.each(filter_groups[strategy], (function(value, key){
      filters_active.push(value.length);
      results.push(strategy_function(value, item));
    }));
    filters_active = filters_active.filter(function(count){ return count > 0});

    return this.compareFilterResults(results, filters_active);
  },

  compareFilterResults: function(results, filters_active){
    var no_filter_groups_are_active = !filters_active.length;
    if (no_filter_groups_are_active){ return false; }

    var item_matches_no_filters = results.reduce(function(previous, current){
      return previous && current;
    }, true);
    if(item_matches_no_filters){ return true; }

    var item_matches_all_active_filters = results.filter(function(result){
      return result === false
    }).length > (filters_active.length - 1);
    if(item_matches_all_active_filters){ return false; }

    var item_matches_only_one_of_many_filters = results.any(function(result){
      return result === false;
    }) && filters_active.length > 1;
    if(item_matches_only_one_of_many_filters){ return true; }

    return false;
  },

  mergeUserAndMemberGroups: function(filter_groups, strategy){
    if(filter_groups[strategy]["user"]){
      filter_groups[strategy]["member"].pushObjects(filter_groups[strategy]["user"]);
      filter_groups[strategy]["user"] = [];
    }
  },

  ////ANDS (item must match all of the active filters)
  groupingStrategy: function(filters, item){
    return filters.any(function(filter){
      return !filter.condition(item);
    });
  },
  ////ORS (item must match any of the active filters)
  inclusiveStrategy: function(filters, item){
    return !filters.any(function(filter){
      return filter.condition(item);
    });
  },
});

export default IssueFiltersMixin;
