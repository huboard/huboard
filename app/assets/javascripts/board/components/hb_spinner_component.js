var Spinner = require('../../spin.js');
var HbSpinnerComponent = Ember.Component.extend({
  classNames: ["hb-spinner"],
  spinner: function(){
    var opts = {
      lines: 11, // The number of lines to draw
      length: 0, // The length of each line
      width: 6, // The line thickness
      radius: 8, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 19, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#999', // #rgb or #rrggbb or array of colors
      speed: 0.3, // Rounds per second
      trail: 42, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: true, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      left: '0px', // Left position relative to parent in px
      top: '0px',
      position: "absolute"
    };

    new Spinner(opts).spin(this.$().find("> div").get(0));
  }.on('didInsertElement')
});

module.exports = HbSpinnerComponent;
