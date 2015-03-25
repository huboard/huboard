import Ember from 'ember';
import template from 'app/templates/css';

var CssView = Ember.View.extend({
  tagName:"style",
  attributeBindings: ["type"],
  type: "text/css",
  template:template,
  combinedLabels: function(){
    jQuery.Color.fn.contrastColor = function() {
      var r = this._rgba[0], g = this._rgba[1], b = this._rgba[2];
      return (((r*299)+(g*587)+(b*144))/1000) >= 131.5 ? "#333" : "white";
    };
    return _.chain(this.get('content.combinedLabels'))
      .union(this.get('content.link_labels'))
      .map(function(label) {
        var color = $.Color("#" + label.color);
        Ember.set(label, "contrastColor", color.contrastColor());
        Ember.set(label, 'activeColor', color.alpha(0.3).toString());
        Ember.set(label, 'dimColor', color.alpha(0.6).toString());
        return label;
      })
      .value();
  }.property('content.combinedLabels')
});

export default CssView;
