define(["../events/postal","./filterView"], function (postal, filterView) {

  return Backbone.View.extend( { 
    tagName: "ul",
    className: "filters",
    initialize: function (params) {
      console.log("sidebar",params);
      this.milestones = params.data.milestones;
      this.login = params.params.login;
      this.labels = params.data.other_labels;
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

      /*
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
      */
      var userFilter = new filterView({color: "#0069D6", name:"Assigned to me" , condition:function(issue) { return issue.assignee && issue.assignee.login === login; } }).render();
      $(userFilter.el).appendTo($this);


      var grouped = _.groupBy(this.milestones, function (milestone) {
         return milestone._data.status || "backlog";
      }); 

      var combined = (grouped.wip || []).concat(grouped.backlog || []);
      _.each(combined, function (milestone) {
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
      var labels = _.map(this.labels, function(label) {
          return new filterView({color: "#" + label.color, name: label.name, condition: function (issue) { return _.any(issue.labels, function(l){ return l.name === label.name;})}}).render().el;
      });
      $this.append(labels);
      return this;
    }
  });
});
