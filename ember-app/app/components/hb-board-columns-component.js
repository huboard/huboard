var hbSelectColumnComponent = require('./hb_selected_column_component');

var HbBoardColumnsComponent = hbSelectColumnComponent.extend({
  stateClass: '',
  selectedColumn: null,
  visibleColumns: Ember.computed.alias('columns')
})

module.exports = HbBoardColumnsComponent;
