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
      if(event === "channel"){ return; }
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
      if(event_data.identifier === String(message.meta.identifier)){
        callback();
      }
    }
  },

  unsubscribeFromMessages: function(){
    var _self = this;
    _.each(this._subscriptions, function(sub, event){
      if(event === "channel"){ return; }
      _self.get("socket").unsubscribe(sub[0], sub[1]);
      delete _self._subscriptions[event];
    });
  },

  //Publishing
  publish: function(channel, topic, payload){
    var meta = eventParsing.parse(`${channel} ${topic}`, null, this);
    this.get("socket").publish({
      meta: meta,
      payload: payload
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
    this.unsubscribeFromMessages();
    this._super();
  }
});

export default MessagingMixin;
