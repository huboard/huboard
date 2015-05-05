import Ember from 'ember';

export default Ember.View.extend({
  classNames: ['date-picker'],
  format: "yyyy-mm-dd",
  size: 8,
  didInsertElement: function() {
    var self = this;
    return this.$().datepicker({
      format: this.get('format'),
      todayHighlight: true,
      keyboardNavigation: false,
      onSelect: function(dateText){
        self.set("dueDate", dateText);
      }
    });
  }
});
