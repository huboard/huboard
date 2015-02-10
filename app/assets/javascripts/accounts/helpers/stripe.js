Handlebars.registerHelper("stripe-money", function(path) {
  var value = Ember.get(this, path);
  return "$" + parseFloat(value/100).toFixed(0);
});

Handlebars.registerHelper("stripe-date", function(path) {
  var value = Ember.get(this, path);
  var date = new Date(value * 1000);
  return date.toDateString();
});

window.stripe_pub_key = '<%= ENV["STRIPE_PUBLISHABLE_API"] %>'
