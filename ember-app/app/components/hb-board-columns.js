import hbSelectColumnComponent from 'app/components/hb-selected-column';
import Ember from 'ember';


var HbBoardColumnsComponent = hbSelectColumnComponent.extend({
  stateClass: '',
  selectedColumn: null,
  visibleColumns: Ember.computed.alias('columns')
});

export default HbBoardColumnsComponent;
