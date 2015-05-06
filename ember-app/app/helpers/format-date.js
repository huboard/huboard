import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(date){
  var date = moment(date).format("L")
  if (date === "Invalid date") {
    return "none";
  }
  return date;
});
