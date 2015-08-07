import Ember from "ember";
import MessagingMixin from "app/mixins/messaging";
import subscriptionParsing from "app/utilities/messaging/subscription-parsing";

import { test } from "ember-qunit";
import { module } from "qunit";

var mockObject;
function sut(){
  return mockObject.create({
    socket: {
      subscribe: sinon.spy()
    },
    hbsubscriptions: {
      "{sample.channel} topic.{model.id}.action1": "action1Handler",
      "{sample.channel} topic.{model.id}.action2": "action2Handler"
    },
    hbsubscribers: {
      handler: sinon.spy()
    }
  });
}

module("MessagingMixin", {
  beforeEach: function(){
    mockObject = Ember.Object.extend(MessagingMixin);
    sinon.stub(subscriptionParsing, "parse", function(){
      return {channel: sinon.spy()};
    });
  },
  afterEach: function(){
    subscriptionParsing.parse.restore();
  }
});

test("On Init", (assert)=> {
  //It Subscribes to Messages
  mockObject.reopen({
    subscribeToMessages: sinon.spy()
  });
  var instance = sut();

  assert.ok(instance.subscribeToMessages.calledOnce, "Subscribed");
  assert.ok(instance._subscriptions);

  //Opt-Out of Subscribe
  mockObject.reopen({
    subscribeToMessages: sinon.spy(),
    subscribeDisabled: true
  });
  
  instance = sut();
  assert.ok(!instance.subscribeToMessages.called, "Not Subscribed");
});

test("subscribeToMessages", (assert)=> {
  //Subscribe Subscriptions to Messages
  var instance = sut();
  instance.socket = {
    subscribe: sinon.spy()
  };
  subscriptionParsing.parse.reset();
  instance.subscribeToMessages();

  assert.ok(subscriptionParsing.parse.calledTwice, "Both Subscriptions Parsed");
  assert.ok(instance.get("socket.subscribe").calledTwice);
});

test("subHandler", (assert)=> {
  //Message Action Matches the Subscription Data Action
  mockObject.reopen({
    _handleSubInScope: sinon.spy() 
  });

  var sub_data = {action: "ze_action"};
  var message = {meta: {action: "ze_action"}};

  var instance = sut();
  instance._subHandler(sub_data, message);

  assert.ok(instance._handleSubInScope.called, "Subscription is handled");
  
  //Message Action Does not Match the Data Action
  mockObject.reopen({
    _handleSubInScope: sinon.spy() 
  });

  sub_data = {action: "ze_action"};
  message = {meta: {action: "other_action"}};

  instance = sut();
  instance._subHandler(sub_data, message);

  assert.ok(!instance._handleSubInScope.called, "Subscription Not Handled");
});

test("_handleSubInScope", (assert)=> {
  //With Matching Types and Identifiers
  var sub_data = {
    type: "foostype",
    identifier: "1"
  };
  var message = {meta: {
    type: "foostype",
    identifier: "1"
  }};

  var instance = sut();
  var callback = sinon.spy();
  instance._handleSubInScope(sub_data, message, callback);

  assert.ok(callback.called, "Callback was called");

  //With No Type and Matching Identifier
  sub_data = { identifier: "1" };
  message = {meta: {
    identifier: "1"
  }};

  instance = sut();
  callback = sinon.spy();
  instance._handleSubInScope(sub_data, message, callback);

  assert.ok(callback.called, "Callback was called");
  
  //With No Type and wildcard identifier
  sub_data = { identifier: "*" };
  message = {meta: {
    identifier: "*"
  }};

  instance = sut();
  callback = sinon.spy();
  instance._handleSubInScope(sub_data, message, callback);

  assert.ok(callback.called, "Callback was called");

  //With Non-matching Types
  sub_data = { 
    type: "type2",
    identifier: 1
  };
  message = {meta: {
    type: "type1",
    identifier: 1
  }};

  instance = sut();
  callback = sinon.spy();
  instance._handleSubInScope(sub_data, message, callback);

  assert.ok(!callback.called, "Callback was not called");

  //With No Type and non matching identifier
  sub_data = { identifier: 1 };
  message = {meta: {
    identifier: 2
  }};

  instance = sut();
  callback = sinon.spy();
  instance._handleSubInScope(sub_data, message, callback);

  assert.ok(!callback.called, "Callback was not called");
});

test("publish", (assert)=> {
  var topic = "hbsubscriber.{model.indentifier}.test";
  var payload = sinon.spy();
  var meta = {
    channel: "huboard/channel",
    action: "hbsubscriber",
    identifier: 10,
    type: "test"
  };

  subscriptionParsing.parse.restore();
  sinon.stub(subscriptionParsing, "parse", function(){
    return meta;
  });

  var instance = sut();
  instance.socket = {
    publish: sinon.spy()
  };

  instance.publish("huboard/channel", topic, payload);

  assert.ok(subscriptionParsing.parse.called);
  assert.ok(instance.get("socket").publish.calledWith({
    meta: meta,
    payload: payload
  }));
});

test("unsubscribeFromMessages", (assert)=> {
  var subscriptions = {
    sub1: ["channel", "handler"],
    sub2: ["channel", "handler"]
  };

  var instance = sut();
  instance._subscriptions = subscriptions;
  instance.socket = {
    unsubscribe: sinon.spy()
  };
  instance.unsubscribeFromMessages();

  assert.ok(instance.socket.unsubscribe.calledTwice);
  assert.equal(Object.keys(subscriptions), 0);
});
