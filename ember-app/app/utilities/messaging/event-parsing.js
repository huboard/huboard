import Ember from 'ember';

var EventParsing = Ember.Object.create({
  parse: function(event, handler, context){
    var normalized_event = this._normalize(event, context);
    var meta = this._parseMeta(normalized_event, context);
    meta.handler = handler;
    return meta;
  },
  _normalize: function(event, context){
    var normalized = event;
    var matches = event.match(/\{(.*?)\}/g);
    if(!matches){ return event; }

    matches.forEach(function(match){
      var binding = match.substr(1, (match.length - 2));
      normalized = normalized.replace(match, context.get(binding));
    });
    return normalized;
  },
  _parseMeta: function(event, context){
    var keys = event.split(/[ .]/).reverse();
    var channel = keys[3] || this._parseChannel(context);
    return {
      channel: channel.toLowerCase(),
      type: keys[2],
      identifier: keys[1],
      action: keys[0]
    };
  },
  _parseChannel: function(context){
    var channel = context.hbevents.channel;
    var normalized_channel = this._normalize(channel, context);
    return normalized_channel;
  }
});

export default EventParsing;
