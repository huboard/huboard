define(["../events/postal","./filterView"], function (postal, filterView) {

  return Backbone.View.extend( { 
    tagName: "ul",
    className: "filters",
    initialize: function (params) {
      this.milestones = params.data.milestones;
      this.login = params.params.login;
      this.labels = params.data.other_labels;
    },
    render: function () {
      var $this = $(this.el),
          login = this.login;

      var userFilter = new filterView({color: "#0069D6", name:"Assigned to me" , condition:function(issue) { return issue.assignee && issue.assignee.login === login; } }).render();
      $(userFilter.el).appendTo($this);

      // assigned to others?


      var grouped = _.groupBy(this.milestones, function (milestone) {
         return milestone._data.status || "backlog";
      }); 

      var combined = (grouped.wip || []).concat(grouped.backlog || []);
      var milestoneViews = _.map(combined, function (milestone) {
        return new filterView({color: "#0069D6", name: milestone.title, count: milestone.open_issues,
                              condition: function (issue) { return issue.milestone && issue.milestone.title === milestone.title;}}).render().el;
      });
      $this.append(milestoneViews);
      var labels = _.map(this.labels, function(label) {
          return new filterView({color: "#" + label.color, name: label.name, condition: function (issue) { return _.any(issue.labels, function(l){ return l.name === label.name;})}}).render().el;
      });
      $this.append(labels);
      return this;
    }
  });
});
