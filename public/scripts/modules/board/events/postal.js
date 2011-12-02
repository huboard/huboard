define(function(){

  return {
     subscribe: function(channel, callback) {
         postal.channel(channel).subscribe(callback);
     },
     channel : function (channel) {
       return postal.channel(channel);
     },
     publish: function (channel, payload) {
       postal.channel(channel).publish(payload);
     }
  }


});
