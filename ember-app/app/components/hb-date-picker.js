import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['date-picker'],
  didInsertElement: function() {
    var self = this;
    return this.$().datepicker({
      defaultDate: new Date(self.get("dueDate") || new Date()),
      todayHighlight: true,
      keyboardNavigation: false,
      changeYear: true,
      changeMonth: true,
      prevText: '◀',
      nextText: '▶',
      onSelect: function(dateText){
        var date = new Date(dateText);
        self.set("dueDate", date);
      }
    });
  },
  updatePicker: function(){
    if (this._state === "inDOM" && this.get("processing") !== true) {
      this.$().datepicker('setDate', this.get("dueDate"));
    }
  }.observes("dueDate")
});
