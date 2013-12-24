
var SocketMixin = Ember.Mixin.create({
  setUpSocketEvents: function () {
      channelPath  = this.get("sockets.config.channelPath");

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
      
      this.get("socket.socket").on(channel, function (message){
          var parts = message.event.split("."),
              event = parts[0],
              id = parts[1];

          if(messageId != "*" && id != messageId) { return; }

          if(message.correlationId == controller.get("socket.correlationId")) { return; }

          if(eventNames.hasOwnProperty(event)){
            eventNames[event].call(controller, message.payload);
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
