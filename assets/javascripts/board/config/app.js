// require other, dependencies here, ie:
// require('./vendor/moment');

require('../vendor/lodash');
require('../vendor/jquery');
require('../vendor/handlebars');
require('../vendor/ember');

var App = Ember.Application.create({
  rootElement: "#application",
  dimFilters: [],
  hideFilters: []

});

App.deferReadiness();

module.exports = App;

