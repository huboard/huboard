import Ember from "ember";

var MessagingMixin = Ember.Mixin.create({

  ////
  // event_data: {
  //   channel: "thechannel",
  //   action: "theaction",
  //   handler: "theHandler"
  // }
  ////

  //Subscribing
  eventParsing: Ember.inject.service(),
  subscribeToMessages: function(){
    var _self = this;
    var socket = this.get("socket");
    _.each(this.get("events"), function(event, handler){
      var event_data = _self.get("eventParsing").
        parse(event, handler, _self);
      socket.subscribe(event_data.channel, function(message){
        _self._eventHandler(event_data, message);
      });
    });
  },
  _eventHandler: function(event_data, message){
    var _self = this;
    if(event_data.action === message.meta.action){
      this._handleEventInScope(event_data, message, function(){
        _self._eventHandlers[event_data.handler](message.payload);
      });
    }
  },
  _handleEventInScope: function(event_data, message, callback){
    if(!event_data.type || event_data.type === message.meta.type){
      if(event_data.identifier === "*"){ callback(); }
      if(event_data.identifier === message.meta.identifier){
        callback();
      }
    }
  },

  //Publishing


  //Lifecycle
  setupMessaging: function(){
    if(!this.get("socket") || !this.get("events")){
      throw "Missing the Socket Mixin or the Events Mixin!";
    }
    this.subscribeToMessages();
  }.on("init")
});

export default MessagingMixin;
