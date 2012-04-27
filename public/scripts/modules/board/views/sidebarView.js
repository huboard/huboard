define(["../events/postal"], function (postal) {

  return Backbone.View.extend( { 
    tagName: "ul",
    className: "filters",
    initialize: function (params) {
      this.milestones = params.data.milestones;
      this.login = params.params.login;
    },
    render: function () {
      var $this = $(this.el),
          login = this.login,
          clear = $("<li class='hide clear-filters'><a href='#'>Clear active filters</a></li>");

      clear.click(function(ev){
         ev.preventDefault();
         postal.publish("Filter.Milestone", function (issue,override) { return (override != null) ? override : true; });
         clear.hide();
      });


      clear.appendTo($this);

      var userfilter = $("<li class='drop-shadow'><a href='#'>Assigned to me</a></li>")
      .click(function(ev){
          postal.publish("Filter.Milestone", function (issue) { return issue.assignee ? issue.assignee.login === login : false; });
      });
      userfilter
      .appendTo($this)

      postal.subscribe("Filter.Milestone", function (equal) {
          var active = equal({assignee:{login:login}},false);
          active ? userfilter.addClass("state-active") : userfilter.removeClass("state-active");
          if (active) {clear.show();}
      });

      _.each(this.milestones, function (milestone) {
        var filter = $(_.template("<li class='drop-shadow'><a href='#'><strong><%= open_issues %></strong><%= title %></a></li>", milestone))
        .click(function(){
          postal.publish("Filter.Milestone", function (issue) { return issue.milestone ? issue.milestone.number === milestone.number : false; });
        })
        .appendTo($this);
        postal.subscribe("Filter.Milestone", function (equal) {
          var active = equal({milestone:milestone},false);
          active ? filter.addClass("state-active") : filter.removeClass("state-active");
          if (active) {clear.show();}
        });
      });

      return this;
    }
  });
});
