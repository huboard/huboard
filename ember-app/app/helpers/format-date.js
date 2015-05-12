import Ember from 'ember';
import moment from 'moment';

export default Ember.Handlebars.makeBoundHelper(function(date){
  date = moment(date).format("L");
  if (date === "Invalid date") {
    return "none";
  }
  return date;
});
