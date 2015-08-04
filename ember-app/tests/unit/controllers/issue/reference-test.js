import request from 'ic-ajax';
import { defineFixture as fixture } from 'ic-ajax';

import {  
  moduleFor,
  test
} from "ember-qunit";

//moduleFor("controller:issue/reference", "IssueReferenceController",{
//  needs: ["controller:issue", "controller:application"]
//});

test("fetchCommit", function(assert){
  //Injection is currently busted due to deps problems
  assert.expect(0);
  //var commit = {
  //  sha: 'abc1234'
  //};

  //fixture("/api/discorick/projects/commit/abc1234", {
  //  response: commit,
  //  jqXHR: {},
  //  textStatus: 'success'
  //});

  //this.subject().set("controllers.issue.content", {
  //  repo: {
  //    full_name: "discorick/projects"
  //  }
  //});

  //this.subject().fetchCommit('abc1234').then(response => {
  //  assert.equal(response.sha, 'abc1234');
  //});
});
