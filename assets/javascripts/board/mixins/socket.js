
var SocketMixin = Ember.Mixin.create({
  setUpSocketEvents: function () {
    if(!this.get("socket")){
      return;
    }
    var channelPath  = this.get("sockets.config.channelPath");

    if(!channelPath) {
     throw "You must define a channelPath";
    }

    var messagePath  = this.get("sockets.config.messagePath");

    if(!messagePath) {
     throw "You must define a messagePath";
    }

    Ember.run.schedule("afterRender", this, function(){
      var channel = this.get(channelPath),
          messageId = this.get(messagePath),
          eventNames = this.get("sockets") || {},
          controller = this;
      
      this.get("socket").subscribe(channel, function (message){

          if(messageId != "*" && message.meta.identifier != messageId) { return; }

          if(message.meta.correlationId == controller.get("socket.correlationId")) { return; }

          if(eventNames.hasOwnProperty(message.meta.action)){
            eventNames[message.meta.action].call(controller, message.payload);
            App.incrementProperty("eventReceived")
          }
      });
    });
  },
  init: function () {
    this._super();
    this.setUpSocketEvents();
  }
});

module.exports = SocketMixin;
