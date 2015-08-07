import Ember from 'ember';

var SubscriptionParsing = Ember.Object.create({
  parse: function(subscription, handler, context){
    var normalized_sub = this._normalize(subscription, context);
    var meta = this._parseMeta(normalized_sub, context);
    meta.handler = handler;
    return meta;
  },
  _normalize: function(subscription, context){
    var normalized = subscription;
    var matches = subscription.match(/\{(.*?)\}/g);
    if(!matches){ return subscription; }

    matches.forEach(function(match){
      var binding = match.substr(1, (match.length - 2));
      normalized = normalized.replace(match, context.get(binding));
    });
    return normalized;
  },
  _parseMeta: function(subscription, context){
    var keys = subscription.split(/[ .]/).reverse();
    var channel = keys[3] || this._parseChannel(context);
    return {
      channel: channel.toLowerCase(),
      type: keys[2],
      identifier: keys[1],
      action: keys[0]
    };
  },
  _parseChannel: function(context){
    var channel = context.hbsubscriptions.channel;
    var normalized_channel = this._normalize(channel, context);
    return normalized_channel;
  }
});

export default SubscriptionParsing;
