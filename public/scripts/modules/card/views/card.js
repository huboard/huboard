define(["../../common/events/postal","text!../templates/card.html"],function (postal, template) {
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
      this.issue = issue;
      this.render(issue.attributes);
    }
  });
});
