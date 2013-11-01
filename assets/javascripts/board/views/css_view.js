

var CssView = Ember.View.extend({
  tagName:"style",
  attributeBindings: ["type"],
  type: "text/css",
  render: function () {
    
    var buffer = this.buffer,
        that = this;
    _(["filter","card-label"]).each(function(name){
       _(that.get("content.other_labels")).each(function(l){
       
         _([
           ".<%= name %>.-x<%= color %> a.dim, .<%= name %>.-x<%= color %> a.dim:hover",
           ".<%= name %>.-x<%= color %> a.active, .<%= name %>.-x<%= color %> a.active:hover",
           ".<%= name %>.-x<%= color %>.active, .<%= name %>.-x<%= color %>.active:hover"
           ]).each(function(style){
             var start = _.template(style,{name: name, color: l.color});
             buffer.push(start);
             buffer.push("{")
             buffer.push("background-color: #" + l.color + ";")
             buffer.push("}");
           })
       });
    });
  }
});

module.exports = CssView;
