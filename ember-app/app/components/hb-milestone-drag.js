import Ember from 'ember';

var HbMilestoneDrag = Ember.Component.extend({
  classNameBindings: ["dragging:board-dragging:board-not-dragging"],
  testOnInsert: function() {
  }.on('didInsertElement')
});

export default HbMilestoneDrag;
