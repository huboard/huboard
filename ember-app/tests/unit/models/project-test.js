import Repo from 'app/models/project';
import repo from '../../fixtures/repo';

import request from 'ic-ajax';
import { defineFixture as fixture } from 'ic-ajax';
import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('model:project');

test('it exists', function(assert) {

  var model = this.subject();
  // var store = this.store();
  assert.ok(!!model);
  assert.ok(fixture);
  assert.ok(sinon);
});

test('baseUrl is based off repo.full_name', function(assert){
  var model = Repo.create(repo);

  assert.equal(model.get('baseUrl'), "/api/rauhryan/huboard");
});

test('links should reference parent repo', function(assert) {
  //arrange
  var model = Repo.create(repo);

  fixture('/api/rauhryan/huboard/linked/rauhryan/ghee', {
    response: {_repo: {full_name: "rauhryan/ghee"}},
    textStatus: 'success',
    jqXHR: {}
  });

  //act
  model.fetchLinks().then(function(response) {
    //assert
    assert.ok(response);
    assert.equal(response[0].get('repo'), model);
  });
});
