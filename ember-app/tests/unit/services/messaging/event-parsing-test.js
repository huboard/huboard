import Ember from "ember";
import EventParsingService from "app/services/messaging/event-parsing";

import {
  moduleFor,
  test
} from "ember-qunit";
import { module } from "qunit";

var sut;
var context;

var event1 =  "{channel.one} karate.{model.correlationId}.kick";
var event2 =  "{channel.two} jitz.{model.name}.punch";
var event3 = "{channel.two} kungfu.{*}.jab";
var events = {
  event1: "kickHandler",
  event2: "punchHandler",
  event3: "jabHandler"
};

moduleFor("service:messaging/event-parsing", {
  setup: function(){
    context = Ember.Object.create({
      model: Ember.Object.create({
        correlationId: "abc123",
        name: "HuBoard",
      }),
      channel: Ember.Object.create({
        one: "huboard/rocks",
        two: "HuBoard/Rolls",
      })
    });

    sut = this.subject();
  }
});

test("parse", (assert)=> {
  //Parses event 1
  var result = sut.parse(event1, events["event1"], context);

  assert.equal(result.channel, context.get("channel.one"));
  assert.equal(result.identifier, context.get("model.correlationId"));
  assert.equal(result.action, "kick");
  assert.equal(result.handler, "kickHandler");

  //Parses event 2
  result = sut.parse(event2, events["event2"], context);

  assert.equal(result.channel, "huboard/rolls");
  assert.equal(result.identifier, context.get("model.name"));
  assert.equal(result.action, "punch");
  assert.equal(result.handler, "punchHandler");
  
  //Parses event 2
  result = sut.parse(event3, events["event3"], context);

  assert.equal(result.channel, "huboard/rolls");
  assert.equal(result.identifier, "*");
  assert.equal(result.action, "jab");
  assert.equal(result.handler, "jabHandler");
});

test("_parseChannel", (assert)=> {
  //Parses the Channel
  var result = sut._parseChannel(event1, context);
  assert.equal(result, "huboard/rocks");

  //Ensures Channels are lowercased
  result = sut._parseChannel(event2, context);
  assert.equal(result, "huboard/rolls");
});

test("_parseAction", (assert)=> {
  //Parses the Action
  var result = sut._parseAction(event1);
  assert.equal(result, "kick");
});

test("_parseIdentifier", (assert)=> {
  //Identifier is a binding
  var result = sut._parseIdentifier(event1, context);
  assert.equal(result, "abc123", "Matches the Binding");
  
  //Identifier is a wildcard
  result = sut._parseIdentifier(event3, context);
  assert.equal(result, "*", "Matches the Wildcard");
});

test("_parseType", (assert)=> {
  //Parses the Action
  var result = sut._parseType(event1);
  assert.equal(result, "karate");

  result = sut._parseType(event2);
  assert.equal(result, "jitz");

  result = sut._parseType(event3);
  assert.equal(result, "kungfu");
});
