define(["./milestones_list","../collections/milestones"],function(listView, collection){


  return function (element, params) {
      var queue = new listView(params);
      var wip = new listView(params);

      this.onfetch = function (data) {

        $(element)
          .append("<h3>Work In Progress")
          .append(wip.render().el)
          .append("<h3>Backlog")
          .append(queue.render().el);

        var grouped = _.groupBy(data, function (milestone){
          return milestone._data.status || "backlog";
        })

        grouped.wip && wip.onfetch(grouped.wip);
        grouped.backlog && queue.onfetch(grouped.backlog);
      }

      collection.fetch(params.user,params.repo);
      collection.bind("ondatareceived", this.onfetch, this);

  };



})
