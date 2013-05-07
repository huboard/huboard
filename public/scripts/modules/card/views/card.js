define(["../../common/events/postal",
       "text!../templates/card.html",
        "text!../templates/feed.html",
        "./actions/labels"],function (postal, template, feed, labels) {

  var actions = {
    labels : labels
  }

  return Backbone.View.extend({
    tagName: "div",
    className : "fullscreen-card",
    initialize: function (params) {
      postal.subscribe("Card.Fullscreen",$.proxy(this.open, this));
    },
    render: function (attributes) {
      $(this.el).html( _.template(template, attributes))
      return this;
    },
    open: function (issue) {
      var that = this;
      this.issue = issue;
      this.render(issue.attributes);
      $.getJSON("/api/" + issue.attributes.repo.owner.login + "/" + issue.attributes.repo.name + "/issues/" + issue.attributes.number + "/feed")
        .done(function (feedData) {
          $(that.el).find(".fullscreen-card-left")
            .append(_.template(feed, feedData))

          var k = null;
          for(k in feedData.actions) {
              $(that.el).find("." + k + "-placeholder")
                .append(actions[k].create(feedData.actions[k], that.issue).render().el);
          }
        })
    }
  });
});
