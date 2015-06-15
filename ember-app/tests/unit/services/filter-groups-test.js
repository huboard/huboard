import {
  moduleFor,
  test
} from 'ember-qunit';

var service;
var groups;
moduleFor('service:filter-groups', {
  needs: [
    'service:filter_groups/board',
    'service:filter_groups/milestone',
    'service:filter_groups/label',
    'service:filter_groups/user',
    'service:filter_groups/member',
    'service:filter_groups/search'
  ],
  setup: function(){
    service = this.subject();
    groups = ["board", "milestone", "label", "user", "member", "search"];
  }
});

test('registers the filter groups', function(assert) {
  groups.forEach(function(group){
    assert.ok(service.get(group));
  });
});

test('sets up the filter groups', function(assert){
  var model = {the_board: {}};
  groups.forEach(function(group){
    service.set(`${group}.create`, sinon.stub());
  });

  service.setGroups(model);
  groups.forEach(function(group){
    assert.ok(service.get(`${group}.create`).calledWith(model));
  });
  assert.equal(service.get("created"), true);
});

test('returns concated filters', function(assert){
  var filters = [{
    name: "filterMeBrah",
    mode: 1
  }]
  groups.forEach(function(group){
    service.set(`${group}.filters`, filters);
  });
})
