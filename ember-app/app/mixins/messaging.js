import Ember from "ember";
import subscriptionParsing from "app/utilities/messaging/subscription-parsing";

var MessagingMixin = Ember.Mixin.create({

  ////
  // sub_data: {
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
    _.each(this.get("hbsubscriptions"), function(handler, subscription){
      if(subscription === "channel"){ return; }
      var sub_data = subscriptionParsing.parse(subscription, handler, _self);
      var subscriber = socket.subscribe(sub_data.channel, function(message){
        if(socket.correlationId !== message.meta.correlationId){
          _self._subHandler(sub_data, message);
        }
      });
      _self._subscriptions[subscription] = [sub_data.channel, subscriber];
    });
  },
  _subHandler: function(sub_data, message){
    var _self = this;
    if(sub_data.action === message.meta.action){
      this._handleSubInScope(sub_data, message, function(){
        _self.hbsubscribers[sub_data.handler].call(_self, message.payload);
      });
    }
  },
  _handleSubInScope: function(sub_data, message, callback){
    if(!message.meta.type || sub_data.type === message.meta.type){
      if(sub_data.identifier === "*"){ callback(); }
      if(sub_data.identifier === String(message.meta.identifier)){
        callback();
      }
    }
  },

  unsubscribeFromMessages: function(){
    var _self = this;
    _.each(this._subscriptions, function(sub, subscriber){
      if(subscriber === "channel"){ return; }
      _self.get("socket").unsubscribe(sub[0], sub[1]);
      delete _self._subscriptions[subscriber];
    });
  },

  //Publishing
  publish: function(channel, topic, payload){
    var meta = subscriptionParsing.parse(`${channel} ${topic}`, null, this);
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
