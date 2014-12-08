// require other, dependencies here, ie:
// require('./vendor/moment');

require('../vendor/lodash');
require('../vendor/jquery');
require('../vendor/handlebars');
require('../vendor/ember');
require("../vendor/autoresize");
require("../vendor/jquery.textcomplete");
require("../vendor/task_list.js");
var color = require('../../vendor/jquery.color');
require('../utilities/observers');

var Markdown = require("../vendor/marked")

Ember.LinkView.reopen({
  init: function(){
    this._super.apply(this, arguments);

    this.on("click", this, this._closeDropdown);
  },
  tearDownEvent: function(){
    this.off("click");
  }.on("willDestroyElement"),
  _closeDropdown : function(ev) {
    this.$().parents(".dropdown").removeClass("open")
  }
})

var correlationId = require("../utilities/correlationId")

Ember.onLoad("Ember.Application", function ($app) {
  $app.initializer({
    name: "sockets",
    initialize : function (container, application){
      if(application.get("socketBackend")){
        var socket = Ember.Object.extend({
          correlationId : correlationId,
          sockets: {},
          client: new Faye.Client(application.get('socketBackend')),
          subscribe: function (channel, callback) {
            this.get("sockets")[channel].callbacks.add(callback);
          },
          subscribeTo: function(channel) {
            var client = this.get('client'), 
              callbacks = Ember.$.Callbacks();
              client.disable("eventsource");
            var source = client.subscribe("/" + channel, function(event){
              callbacks.fire(event);
            });
            this.get("sockets")[channel] = {
              source: source,
              callbacks: callbacks
            };

          },
          init: function () {
            this.subscribeTo(this.get("repo.full_name"));
          }
        });
      } else {
        var socket = Ember.Object.extend({
          correlationId : correlationId,
          sockets: {},
          subscribe: Ember.K,
          subscribeTo: Ember.K
        })
      }

        application.set("Socket", socket);

        application.register('socket:main',application.Socket, {singleton: true});
        application.inject('socket:main', 'repo', 'repo:main');

        application.inject("controller","socket", "socket:main");
        application.inject("model", "socket", "socket:main");
        application.inject("route", "socket", "socket:main");
    }
  })
  $app.initializer({
    name: "settings",
    before: "sockets",
    initialize: function(container, application) {
      application.register('repo:main', application.get("repo"), {instantiate: false});
      application.register('settings:main', application.Settings);
      application.inject('settings:main', 'repo', 'repo:main');
      application.inject('controller', 'settings', 'settings:main');
      application.inject('view', 'settings', 'settings:main');

      application.register('global:main', application.Global);
      application.inject('controller', 'global', 'global:main');
      application.inject('view', 'global', 'global:main');
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

