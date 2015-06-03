import Ember from 'ember';

var IssueFiltersMixin = Ember.Mixin.create({
  //Public Methods
  matchesFilter: function(item, filters){
    return this.filter(filters, item);
  },

  //Filtering Strategies
  filter: function(filters, item){
    var grouping = this.filterByStrategy(filters, "grouping");
    var inclusive = this.filterByStrategy(filters, "inclusive");

    var ands = this.groupingStrategy(grouping, item);
    var ors = this.inclusiveStrategy(inclusive, item);

    if(ands && grouping.length){ return ands }
    if(ors && inclusive.length){ return ors }
    return false;
  },
  filterByStrategy: function(filters, strategy){
    return filters.filter(function(f){
      return f.strategy === strategy
    });
  },

  ////ANDS (item must must all of the active filters)
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
