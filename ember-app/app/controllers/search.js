import Ember from 'ember';


var SearchController = Ember.Controller.extend({
  filters: Ember.inject.service(),
  termBinding: "filters.filterGroups.search.term",
});

export default SearchController;
