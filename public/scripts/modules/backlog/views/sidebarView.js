define(["../../common/events/postal","./filterView"], function (postal, filterView) {

  return Backbone.View.extend( { 
    tagName: "ul",
    className: "filters",
    initialize: function (params) {
      this.login = params.params.login;
      this.labels = params.data.other_labels;
    },
    render: function () {
      var $this = $(this.el),
      login = this.login;

      if (login) {
        var assignedToMe = new filterView({color: "#0069D6", name:"Assigned to me" , condition:function(issue) { return issue.assignee && issue.assignee.login === login; } }).render();
        var assignedToOthers = new filterView({color: "#0069D6", name:"Assigned to others" , condition:function(issue) { return issue.assignee && issue.assignee.login !== login; } }).render();
      }
      var unassigned = new filterView({color: "#0069D6", name:"Unassigned issues" , condition:function(issue) { return !issue.assignee; } }).render();

      var userFilterViews = login ? $([assignedToMe.el,assignedToOthers.el,unassigned.el]) : $(unassigned.el);

      $this.append(userFilterViews);

      userFilterViews
      .click(function(ev) {
        ev.preventDefault();
        var $this = $(this),
        $clicked = $this.data("filter");
        var othersActive = _(userFilterViews).filter(function(v) {
          var data = $(v).data("filter");
          return $clicked.cid !== data.cid && data.state !== 0;        
        });
        _(othersActive).each(function(v) {
          $(v).trigger("clear");
        });
      });


      var labels = _.map(this.labels, function(label) {
        return new filterView({color: "#" + label.color, name: label.name, condition: function (issue) { return _.any(issue.labels, function(l){ return l.name.toLocaleLowerCase() === label.name.toLocaleLowerCase();})}}).render().el;
      });                                                                                                                                                                                                             
      $this.append("<h5>Labels</h5>");
      $this.append(labels);
      return this;
    }
  });
});
