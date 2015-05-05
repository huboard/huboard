import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['date-picker'],
  dateText: "",
  didInsertElement: function() {
    var self = this;
    return this.$().datepicker({
      defaultDate: 0,
      todayHighlight: true,
      keyboardNavigation: false,
      changeYear: true,
      onSelect: function(dateText){
        var date = new Date(dateText);
        self.set("dueDate", date.toISOString());
        self.set("dateText", dateText);
      }
    });
  }
});
