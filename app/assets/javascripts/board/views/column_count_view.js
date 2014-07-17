var ColumnCountView = Ember.View.extend({
  tagName: "span",
  templateName: "column_count",
  classNameBindings: ["isOverWip:hb-state-error"],
  isOverWip: Ember.computed.alias('controller.isOverWip')
});

module.exports = ColumnCountView;
