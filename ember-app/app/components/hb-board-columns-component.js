import hbSelectColumnComponent from 'app/components/hb-selected-column-component';
import Ember from 'ember';


var HbBoardColumnsComponent = hbSelectColumnComponent.extend({
  stateClass: '',
  selectedColumn: null,
  visibleColumns: Ember.computed.alias('columns')
})

export default HbBoardColumnsComponent;
