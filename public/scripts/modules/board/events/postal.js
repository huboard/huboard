define(["socket"],function(socket){
	function S4() {
	   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	}
	function guid() {
	   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

  var sockets = {},
      correlationId = guid();


  return {
     correlationId: correlationId,
     subscribe: function(channel, callback) {
         postal.channel(channel).subscribe(callback);
     },
     channel : function (channel) {
       return postal.channel(channel);
     },
     publish: function (channel, payload) {
       postal.channel(channel).publish(payload);
     },
     socket: function (channel, event, callback) {
         var theChannel =  postal.channel(channel);

        postal.channel(event).subscribe(callback);

         if(sockets[channel]) {
           return;
         } else {
           sockets[channel] = channel;
           socket.on(channel, function (message) {
             message.correlationId !== correlationId && postal.channel(message.event).publish(message.payload);
           });
         }
     }
  }


});
