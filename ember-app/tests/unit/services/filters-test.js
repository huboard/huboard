import Ember from "ember";
import {
  moduleFor,
  test
} from "ember-qunit";

var service;
var mockFilterGroups;

moduleFor("service:filters", {
  needs: [ "service:queryParams"],
  beforeEach: function(){
    mockFilterGroups = Ember.Object.create({
      search: {filters: [], term: "issuesPlease!"},
      board: Ember.Object.create({ 
        filters: [
          { name: "MockFilter", mode: 1 }
        ]
      }),
      allFilters: Ember.A([
        { name: "MockFilter", mode: 1 }
      ])
    });

    service = this.subject({
      filterGroups: mockFilterGroups 
    });
    service.set("filterGroups.created", true);
  }
});

test("assigns unknown properties to filters", (assert)=>{
  var filter;
  filter = service.get("boardFilters");

  assert.equal(filter, mockFilterGroups.board.filters);
});

test("clears the filters", (assert)=>{
  service.set("qps", {clear: sinon.stub()});
  service.clear();

  var allFilters = service.get("filterGroups.allFilters");
  var searchTerm = service.get("filterGroups.search");

  assert.equal(allFilters.get("firstObject").mode, 0);
  assert.equal(searchTerm.term, "");
  assert.ok(service.get("qps.clear").called);
});

test("observes filter changes and sets dim/hide filters", (assert)=>{
  //Initial States
  assert.equal(service.get("dimFilters").length, 0, "Dim = Empty");
  assert.equal(service.get("hideFilters").length, 0, "Hide = Empty");

  //After Filter Changes
  Ember.run(function(){
    var new_filter = { name: "MockFilter", mode: 2 };
    service.get("filterGroups.allFilters").pushObject(new_filter);
  });

  assert.equal(service.get("hideFilters").length, 1, "Hide has 1");
  assert.equal(service.get("dimFilters").length, 1, "Dim has 1");
});

test("allFiltersObject", (assert)=> {
  service.set("filterGroups.groups", ["board", "search"]);

  var result = service.get("allFiltersObject");

  assert.equal(result.board.length, 1);
  assert.equal(result.search.length, 0);
});

test("hiddenFiltersObject", (assert)=> {
  //Disable forcing dims to active state for test
  service.reopen({ forceBoardsToActive: null });

  service.set("filterGroups.groups", ["board", "search"]);
  service.set("filterGroups.board.strategy", "inclusive");
  service.set("filterGroups.search.strategy", "grouping");

  var hidden_filter = {mode: 2};
  service.get("filterGroups.board.filters").
    pushObject(hidden_filter);
  service.get("filterGroups.search.filters").
    pushObject(hidden_filter);

  var result = service.get("hiddenFiltersObject");

  assert.equal(result.inclusive.board.length, 1, "Board");
  assert.equal(result.grouping.search.length, 1, "Search");
});

test("dimFiltersObject", (assert)=> {
  service.set("filterGroups.groups", ["board", "search"]);
  service.set("filterGroups.board.strategy", "inclusive");
  service.set("filterGroups.search.strategy", "grouping");

  var dim_filter = {mode: 1};
  service.get("filterGroups.search.filters").
    pushObject(dim_filter);

  var result = service.get("dimFiltersObject");

  assert.equal(result.inclusive.board.length, 1);
  assert.equal(result.grouping.search.length, 1);
});

test("Force Board, Label,& Milestone Groups to Active", (assert)=> {
  //Add an active filter to each group
  var groups = ["board", "label", "milestone"];
  service.set("filterGroups.groups", groups);

  Ember.run(function(){
    groups.forEach(function(group){
      var group_object = { strategy: "grouping", filters: [] };
      service.set(`filterGroups.${group}`, group_object);
      service.get(`${group}Filters`).pushObject({mode: 2});
    });
  });

  //Add a dim filter to each group
  Ember.run(function(){
    groups.forEach(function(group){
      service.get(`${group}Filters`).pushObject({mode: 1});
    });
  });

  var result = service.get("hiddenFiltersObject");

  //all filters should be hidden
  groups.forEach(function(group){
    var length = result.grouping[group].length;
    assert.equal(length, 2);
  });
});

test("Force Member and User Groups to Active", (assert)=> {
  //Add an active filter to the member group 
  var groups = ["member", "user"];
  service.set("filterGroups.groups", groups);

  var group_object = { strategy: "grouping", filters: [] };
  service.set("filterGroups.member", group_object);
  group_object = { strategy: "grouping", filters: [] };
  service.set("filterGroups.user", group_object);

  service.get("memberFilters").pushObject({mode: 2});

  //Add a dim filter to user group
  service.get(`userFilters`).pushObject({mode: 1});

  var result = service.get("hiddenFiltersObject");

  //all filters should be hidden
  var member_length = result.grouping.member.length;
  var user_length = result.grouping.user.length;
  assert.equal(member_length + user_length, 2);
});
