

var CssView = Ember.View.extend({
  tagName:"style",
  attributeBindings: ["type"],
  type: "text/css",
  onLabelsChanged: function () {
    this.rerender()
  }.observes("content.combinedLabels"),
  render: function () {
    
    jQuery.Color.fn.contrastColor = function() {
        var r = this._rgba[0], g = this._rgba[1], b = this._rgba[2];
        return (((r*299)+(g*587)+(b*144))/1000) >= 131.5 ? "#333" : "white";
    };

    var buffer = this.buffer,
        that = this;

    _(_.union(that.get("content.combinedLabels"), this.get("content.link_labels"))).each(function(l){
         var start = _.template(".-x<%= color %>.background",{ color: l.color });
         buffer.push(start);
         buffer.push("{")
         buffer.push("background-color: #" + l.color + ";")
         buffer.push("color: " + $.Color("#"+l.color).contrastColor() + ";")
         buffer.push("}");

         var start = _.template(".-x<%= color %>.border",{ color: l.color });
         buffer.push(start);
         buffer.push("{")
         buffer.push("border-left-color: #" + l.color + ";")
         buffer.push("}");

         var start = _.template(".-x<%= color %>.font-color",{ color: l.color });
         buffer.push(start);
         buffer.push("{")
         buffer.push("color: #" + l.color + ";")
         buffer.push("}");

         var start = _.template(".-x<%= color %>.active",{ color: l.color });

         var color =  $.Color("#"+ l.color).alpha(0.3);
         buffer.push(start);
         buffer.push("{")
         buffer.push("background-color: " + $.Color(color).toString() + ";")
         buffer.push("color: " + $.Color("#"+l.color).contrastColor() + ";")
         buffer.push("}");
    });

    _(["filter","card-label"]).each(function(name){
       _(that.get("content.combinedLabels")).each(function(l){

         buffer.push("." + name + ".-x" + l.color + " > a {");
         buffer.push("border-left-color: #" + l.color + ";");
         buffer.push("}");
       
         _([
           {
             template: ".<%= name %>.-x<%= color %> .dim, .<%= name %>.-x<%= color %> .dim:hover",
             opacity: 0.6
           },
           { 
             template: ".<%= name %>.-x<%= color %> .active, .<%= name %>.-x<%= color %> .active:hover",
             opacity: 1
           },
           {
             template: ".<%= name %>.-x<%= color %>.active, .<%= name %>.-x<%= color %>.active:hover",
             opacity: 1
           },
           {
             template: ".<%= name %>.-x<%= color %>.dim, .<%= name %>.-x<%= color %>.dim:hover",
             opacity: 0.6
           }
           ]).each(function(style){
             var start = _.template(style.template,{name: name, color: l.color, opacity: style.opacity});
             buffer.push(start);
             buffer.push("{")
             buffer.push("background-color: #" + l.color + ";")
             var color =  $.Color("#"+ l.color).alpha(style.opacity);
             buffer.push("background-color: " + $.Color(color).toString() + ";")
             buffer.push("color: " + $.Color("#"+l.color).contrastColor() + ";")
             buffer.push("}");
           })
       });
    });
  }
});

module.exports = CssView;
