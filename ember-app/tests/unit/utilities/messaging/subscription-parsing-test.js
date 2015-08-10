import Ember from "ember";
import SubscriptionParsing from "app/utilities/messaging/subscription-parsing";

import {
  module,
  test
} from "qunit";

var sut;
var context;
var context2;

var subscription1 =  "{channels.one} karate.{model.correlationId}.kick";
var subscription1point5 = "karate.{model.correlationId}.kick";
var subscription2 =  "{channels.two} jitz.{model.name}.punch";
var subscription3 = "{channels.two} kungfu.*.jab";
var subscription4 = "normalized i.am.normal";
var subscription5 = "i.am.normal";
var subscription6 = "im.more.normal";

module("Messaging/SubscriptionParsing", {
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
      hbsubscriptions: {
        channel: "{channels.one}"
      }
    });
    context2 = Ember.Object.create({
      model: Ember.Object.create({
        correlationId: "abc321",
        name: "HuBoard",
      }),
      hbsubscriptions: {
        channel: "zechannel"
      }
    });

    sut = SubscriptionParsing;
  }
});

test("parse", (assert)=> {
  //Parses subscription 1
  var result = sut.parse(subscription1, "kickHandler", context);

  assert.equal(result.channel, context.get("channels.one"));
  assert.equal(result.identifier, context.get("model.correlationId"));
  assert.equal(result.action, "kick");
  assert.equal(result.handler, "kickHandler");

  //Parses subscription 2
  result = sut.parse(subscription2, "punchHandler", context);

  assert.equal(result.channel, "huboard/rolls");
  assert.equal(result.identifier, context.get("model.name"));
  assert.equal(result.action, "punch");
  assert.equal(result.handler, "punchHandler");
  
  //Parses subscription 3
  result = sut.parse(subscription3, "jabHandler", context);

  assert.equal(result.channel, "huboard/rolls");
  assert.equal(result.identifier, "*");
  assert.equal(result.action, "jab");
  assert.equal(result.handler, "jabHandler");

  //Parses subscription 1.5 (fallback on channel key)
  result = sut.parse(subscription1point5, "kickHandler", context);

  assert.equal(result.channel, context.get("channels.one"));
  assert.equal(result.identifier, context.get("model.correlationId"));
  assert.equal(result.action, "kick");
  assert.equal(result.handler, "kickHandler");

  //Parses subscription 4
  result = sut.parse(subscription4, "normalHandler", context);

  assert.equal(result.channel, "normalized");
  assert.equal(result.identifier, "am");
  assert.equal(result.action, "normal");
  assert.equal(result.handler, "normalHandler");
  
  //Parses subscription 5
  result = sut.parse(subscription5, "normalHandler", context);

  assert.equal(result.channel, context.get("channels.one"));
  assert.equal(result.identifier, "am");
  assert.equal(result.action, "normal");
  assert.equal(result.handler, "normalHandler");

  //Parsed subscription 6
  result = sut.parse(subscription6, "normalHandler", context2);

  assert.equal(result.channel, "zechannel");
  assert.equal(result.identifier, "more");
  assert.equal(result.action, "normal");
  assert.equal(result.handler, "normalHandler");
});
