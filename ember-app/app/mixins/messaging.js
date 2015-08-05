import Ember from "ember";
import eventParsing from "app/utilities/messaging/event-parsing";

var MessagingMixin = Ember.Mixin.create({

  ////
  // event_data: {
  //   channel: "thechannel",
  //   indentifier: 1,
  //   type: "sometype",
  //   action: "theaction",
  //   handler: "theHandler"
  // }
  ////

  //Subscribing
  subscribeToMessages: function(){
    var _self = this;
    var socket = this.get("socket");
    _.each(this.get("hbevents"), function(handler, event){
      var event_data = eventParsing.parse(event, handler, _self);
      var sub = socket.subscribe(event_data.channel, function(message){
        if(socket.correlationId !== message.meta.correlationId){
          _self._eventHandler(event_data, message);
        }
      });
      _self._subscriptions[event] = [event_data.channel, sub];
    });
  },
  _eventHandler: function(event_data, message){
    var _self = this;
    if(event_data.action === message.meta.action){
      this._handleEventInScope(event_data, message, function(){
        _self._eventHandlers[event_data.handler].call(_self, message.payload);
      });
    }
  },
  _handleEventInScope: function(event_data, message, callback){
    if(!message.meta.type || event_data.type === message.meta.type){
      if(event_data.identifier === "*"){ callback(); }
      if(event_data.identifier === message.meta.identifier){
        callback();
      }
    }
  },

  //Publishing
  publish: function(channel, event, message){
    this.get("socket").publish({
      meta: {
        channel: channel,
        action: event,
        identifier: message.identifier,
        type: message.type
      },
      payload: message.payload
    });
  },

  //Lifecycle
  init: function(){
    if(!this.get("socket")){
      throw "Missing the Socket!";
    }
    this._super();
    this._subscriptions = {};
    if(!this.get("subscribeDisabled")){
      this.subscribeToMessages();
    }
  },
  willDestroy: function(){
    var _self = this;
    _.each(this._subscriptions, function(sub, event){
      _self.get("socket").unsubscribe(sub[0], sub[1]);
      delete _self._subscriptions[event];
    });
    this._super();
  }
});

export default MessagingMixin;
