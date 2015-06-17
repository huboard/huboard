import {
  moduleFor,
  test
} from "ember-qunit";

var service;
var groups;
moduleFor("service:filter-groups", {
  needs: [
    "service:filter_groups/board",
    "service:filter_groups/milestone",
    "service:filter_groups/label",
    "service:filter_groups/user",
    "service:filter_groups/member",
    "service:filter_groups/search"
  ],
  setup: function(){
    service = this.subject();
    groups = ["board", "milestone", "label", "user", "member", "search"];
  }
});

test("registers the filter groups", (assert)=> {
  groups.forEach(function(group){
    assert.ok(service.get(group));
  });
});

test("sets up the filter groups", (assert)=>{
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

test("returns all filters concated together", (assert)=>{
  //If service.created is false
  all_filters = service.get("allFilters");
  assert.equal(all_filters.length, []);

  //If service.created is true
  var filters = [{ mode: 1 }];

  service.set("created", true);
  groups.forEach(function(group){
    service.set(`${group}.filters`, filters);
  });

  var all_filters = service.get("allFilters");
  assert.equal(all_filters.length, groups.length);
});

test("indicates whether any filters are active", (assert)=>{
  //false if none are active
  var filters = [{ mode: 0 }];

  service.set("created", true);
  groups.forEach(function(group){
    service.set(`${group}.filters`, filters);
  });

  var active = service.get("active");
  assert.ok(!active);

  //true if any are active
  service.set("allFilters.firstObject.mode", 1);

  active = service.get("active");
  assert.ok(active);
});
