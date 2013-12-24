// require other, dependencies here, ie:
// require('./vendor/moment');

require('../vendor/lodash');
require('../vendor/jquery');
require('../vendor/handlebars');
require('../vendor/ember');
require("../vendor/autoresize");
var color = require('../../vendor/jquery.color');
require('../utilities/observers');
var Spinner = require('../../spin');

var Markdown = require("../vendor/marked")

Ember.EventDispatcher = Ember.EventDispatcher.extend({
  events: {
    touchstart  : 'touchStart',
    touchmove   : 'touchMove',
    touchend    : 'touchEnd',
    touchcancel : 'touchCancel',
    keydown     : 'keyDown',
    keyup       : 'keyUp',
    keypress    : 'keyPress',
    mousedown   : 'mouseDown',
    mouseup     : 'mouseUp',
    click       : 'click',
    focusin     : 'focusIn',
    focusout    : 'focusOut',
    submit      : 'submit',
    input       : 'input',
    change      : 'change'
  }
});

var correlationId = require("../utilities/correlationId")

Ember.onLoad("Ember.Application", function ($app) {
  $app.initializer({
    name: "sockets",
    initialize : function (container, application){
      if(application.get("socketBackend")){
        var socket = Ember.Object.extend({
          correlationId : correlationId,
          socket: null,
          init: function () {
            this.set("socket", window.io.connect(application.get("socketBackend")));
          }
        });

        application.set("Socket", socket);

        application.register('socket:main',application.Socket, {singleton: true});

        application.inject("controller","socket", "socket:main");
        application.inject("model", "socket", "socket:main");
      }
    }
  })
})

var App = Ember.Application.create({
  rootElement: "#application",
    dimFilters: [],
    hideFilters: [],
    searchFilter: null,
    memberFilter: null
});

App.Markdown = Markdown;

App.LoadingRoute = Ember.Route.extend({
  renderTemplate: function() {
    if(this.router._activeViews.application){
      return this.render("loading",{ "into" : "application", "outlet" : "loading"});
    }
    this.render("loading");
  }
});

App.LoadingView = Ember.View.extend({
  didInsertElement: function(){
    $("body").addClass("fullscreen-open")
    var opts = {
        lines: 13, // The number of lines to draw
        length: 0, // The length of each line
        width: 6, // The line thickness
        radius: 14, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 19, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#4a3e93', // #rgb or #rrggbb or array of colors
        speed: 0.3, // Rounds per second
        trail: 42, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: true, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '100px', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
      };

    new Spinner(opts).spin(this.$().find("> div").get(0));

    return this._super();
  },
    willDestroyElement: function(){
      $("body").removeClass("fullscreen-open")
        return this._super();
    }
});

App.animateModalClose = function() {
  var promise = new Ember.RSVP.defer();

  $('body').removeClass("fullscreen-open");
  promise.resolve();


  return promise.promise;
};

App.animateModalOpen = function() {
  var promise = new Ember.RSVP.defer();

   $('body').addClass("fullscreen-open");
  promise.resolve();
  

  return promise.promise;
};

App.deferReadiness();

module.exports = App;

