define(["./milestones_list","../collections/milestones"],function(listView, collection){


  return function (element, params) {
      var queue = new listView(_.extend({status:"backlog"},params));
      var wip = new listView(_.extend({status:"wip"},params));

      this.onfetch = function (data) {

        $(element)
          .append($(wip.render().el).prepend("<h3>Work In Progress"))
          .append($(queue.render().el).prepend("<h3>Backlog"))

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
