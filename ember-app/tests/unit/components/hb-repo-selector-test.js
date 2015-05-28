import Ember from "ember";

import {  
  moduleForComponent,
  test
} from "ember-qunit";

var sut;
var repos;
var selectedRepo;
var MockController;

moduleForComponent("hb-repo-selector", "HbRepoSelectorComponent", {
  setup: function(){
    repos = [
      { full_name: "defaultRepo" },
      { full_name: "linkedRepo1" },
      { full_name: "linkedRepo2" }
    ];

    MockController = Ember.Controller.extend({
      selectedRepo: { full_name: "defaultRepo" }
    }).create();

    sut = this.subject({
      controller: MockController,
      //{{hb-selected-repo selectedBinding=foo }}
      selectedBinding: 'controller.selectedRepo',
      //{{hb-selected-repo repos=[foos] }}
      repos: repos
    });
  }
});

test("Initializing Properties", assert => {
  assert.deepEqual(sut.get("isOpen"), false);
  assert.deepEqual(sut.get("repos"), repos);
  assert.deepEqual(sut.get("selected"), MockController.get("selectedRepo"));
});
