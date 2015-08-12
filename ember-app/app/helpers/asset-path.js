import Ember from 'ember';

export default Ember.Helper.helper(function(name) {
  var path;
  path = window.ASSETS.path(name);
  return new Ember.Handlebars.SafeString(path);
});

