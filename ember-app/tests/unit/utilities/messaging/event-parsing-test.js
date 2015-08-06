import Ember from "ember";
import EventParsing from "app/utilities/messaging/event-parsing";

import {
  module,
  test
} from "qunit";

var sut;
var context;

var event1 =  "{channels.one} karate.{model.correlationId}.kick";
var event1point5 = "karate.{model.correlationId}.kick";
var event2 =  "{channels.two} jitz.{model.name}.punch";
var event3 = "{channels.two} kungfu.*.jab";
var event4 = "normalized i.am.normal";
var event5 = "i.am.normal";

var events = {
  event1: "kickHandler",
  event2: "punchHandler",
  event3: "jabHandler",
  event4: "normalHandler"
};

module("Messaging/EventParsing", {
  setup: function(){
    context = Ember.Object.create({
      model: Ember.Object.create({
        correlationId: "abc123",
        name: "HuBoard",
      }),
      channels: Ember.Object.create({
        one: "huboard/rocks",
        two: "HuBoard/Rolls",
      }),
      hbevents: {
        channel: "channels.one"
      }
    });

    sut = EventParsing;
  }
});

test("parse", (assert)=> {
  //Parses event 1
  var result = sut.parse(event1, events["event1"], context);

  assert.equal(result.channel, context.get("channels.one"));
  assert.equal(result.identifier, context.get("model.correlationId"));
  assert.equal(result.action, "kick");
  assert.equal(result.handler, "kickHandler");

  //Parses event 2
  result = sut.parse(event2, events["event2"], context);

  assert.equal(result.channel, "huboard/rolls");
  assert.equal(result.identifier, context.get("model.name"));
  assert.equal(result.action, "punch");
  assert.equal(result.handler, "punchHandler");
  
  //Parses event 3
  result = sut.parse(event3, events["event3"], context);

  assert.equal(result.channel, "huboard/rolls");
  assert.equal(result.identifier, "*");
  assert.equal(result.action, "jab");
  assert.equal(result.handler, "jabHandler");

  //Parses event 1.5 (fallback on channel key)
  result = sut.parse(event1point5, events["event1"], context);

  assert.equal(result.channel, context.get("channels.one"));
  assert.equal(result.identifier, context.get("model.correlationId"));
  assert.equal(result.action, "kick");
  assert.equal(result.handler, "kickHandler");

  //Parses event 4
  result = sut.parse(event4, events["event4"], context);

  assert.equal(result.channel, "normalized");
  assert.equal(result.identifier, "am");
  assert.equal(result.action, "normal");
  assert.equal(result.handler, "normalHandler");
  
  //Parses event 5
  result = sut.parse(event5, events["event4"], context);

  assert.equal(result.channel, context.get("channels.one"));
  assert.equal(result.identifier, "am");
  assert.equal(result.action, "normal");
  assert.equal(result.handler, "normalHandler");
});
