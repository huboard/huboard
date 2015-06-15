import Ember from "ember";

import {  
  moduleFor,
  test
} from "ember-qunit";

var view;
var parentView;
var Promise = Ember.RSVP.Promise;

moduleFor("view:issue/reference", "IssueReferenceView", {
  setup: function(){
    var self = this;
    view = this.subject();
    view.set("parentView", {content: {model: {commit_id: "abc1234"}}});

    //Attach the reference view to dependant parent
    parentView = Ember.ContainerView.extend({
      classNames: ["card-event", "card-event-referenced"],
      childViews: [view],
      container: self.container
    }).create();
    Ember.run(function(){
      parentView.appendTo('#ember-testing');
    });

    //Setup Dummy controller
    var controller = {
      fetchCommit: function(){
        return new Promise(function(resolve, reject){
          resolve("abc1234");
        });
      }
    };
    Ember.run(function(){
      view.set("controller", controller);
    });
  }
});

test("Static Propteries", assert => {
  assert.equal(view.get("isProcessing"), false);
  assert.equal(view.get("commit"), null);
});

test("didInsertElement", assert => {
  //Test Model Setup
  assert.ok(view.get("model"));

  //Test Hover Event
  Ember.run(function(){
    view.$().closest(".card-event").trigger("mouseenter");
  });
  //##view is made visible
  assert.equal(view.get("isVisible"), true);
  //##fetchCommit
  assert.equal(view.get("commit"), "abc1234");
});
