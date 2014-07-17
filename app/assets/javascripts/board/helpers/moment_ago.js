var moment = require("../vendor/moment.min");
Ember.Handlebars.registerBoundHelper('momentAgo', function(date) {
  var escaped = Handlebars.Utils.escapeExpression(moment(date).fromNow());
  return new Handlebars.SafeString('<span class="moment-ago">' + escaped + "</span>");
});

