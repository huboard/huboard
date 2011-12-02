define(["../events/postal"], function (postal) {

  return Backbone.View.extend( { 
     tagName: "ul",
     className: "filters",
     initialize: function (params) {
         this.milestones = params.milestones;
     },
     render: function () {
       var $this = $(this.el);
       _.each(this.milestones, function (milestone) {
         var filter = $(_.template("<li class='drop-shadow'><a href='#'><strong><%= open_issues %></strong><%= title %></a></li>", milestone))
            .click(function(){
              postal.publish("Filter.Milestone", function (issue) { return issue.milestone ? issue.milestone.number === milestone.number : false; });
            })
            .appendTo($this);
          postal.subscribe("Filter.Milestone", function (equal) {
             equal({milestone:milestone}) ? filter.addClass("state-active") : filter.removeClass("state-active");
          });
       });
       return this;
     }
  });
});
