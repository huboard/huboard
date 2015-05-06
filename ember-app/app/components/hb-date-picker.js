import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['date-picker'],
  dateText: "",
  didInsertElement: function() {
    var self = this;
    return this.$().datepicker({
      defaultDate: new Date(self.get("dueDate")),
      todayHighlight: true,
      keyboardNavigation: false,
      changeYear: true,
      changeMonth: true,
      prevText: '◀',
      nextText: '▶',
      onSelect: function(dateText){
        var date = new Date(dateText);
        self.set("dueDate", date);
        self.set("dateText", dateText);
      }
    });
  },
  updatePicker: function(){
    this.$().datepicker('setDate', this.get("dueDate"));
  }.observes("dueDate")
});
