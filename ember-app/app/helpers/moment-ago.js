import moment from 'app/"../vendor/moment.min"';
import Ember from 'ember';


Ember.Handlebars.registerBoundHelper('momentAgo', function(date) {
  var escaped = Handlebars.Utils.escapeExpression(moment(date).fromNow());
  return new Handlebars.SafeString('<span class="moment-ago">' + escaped + "</span>");
});

export default undefined;
