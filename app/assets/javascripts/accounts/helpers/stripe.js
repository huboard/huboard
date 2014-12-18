Handlebars.registerHelper("stripe-money", function(path) {
  var value = Ember.getPath(this, path);
  return "$" + parseFloat(value/100).toFixed(0);
});

Handlebars.registerHelper("stripe-date", function(path) {
  var value = Ember.getPath(this, path);
  var date = new Date(value * 1000);
  return date.toDateString();
});
