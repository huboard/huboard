define(["../../common/events/postal"], function(postal) {
    jQuery.Color.fn.contrastColor = function() {
        var r = this._rgba[0], g = this._rgba[1], b = this._rgba[2];
        return (((r*299)+(g*587)+(b*144))/1000) >= 131.5 ? "#333" : "white";
    };

    return Backbone.View.extend({
       tagName: "li",
       className: "filter",
       initialize: function(params) {
            this.params = params;
            this.condition = params.condition;
            this.name = params.name;
            this.type = params.type || "Simple";
            this.state = 0;
            this.states = [0,1,2,0];
       },
       events: {
          "click" : "clicked",
          "clear" : "clearAndPublish",
          "click .ui-icon" : "clearAndPublish"
       },
       render: function() {
         $(this.el)
         .html("<a href='#'>"+ this.name + "<span class='ui-icon ui-icon-x'></span></a>").addClass("-x" + this.params.color.substring(1) )
         .data("filter",this);
         return this;
       },
       clicked : function(ev) {
         ev.preventDefault();
         switch(this.state = this.states[this.state + 1]) {
           case 0:
             this.clear();
           break;
           case 1:
             this.fade();
           break;
           case 2:
             this.solid();
           break;
         }
         this.publish();
       },
       clear: function(){
         $(this.el).find("a").removeClass("dim").removeClass("active");
       },
       publish : function() {
         postal.publish("Filter." + this.type, { id: this.cid, condition: this.condition, state:this.state});
       },
       clearAndPublish: function(ev) {
         ev.preventDefault();
         this.state = 0;
         this.publish();
         this.clear();
         return false;
       },
       fade: function(){
         $(this.el).find("a").addClass("dim").removeClass("active");

       },
       solid: function(){
         $(this.el).find("a").addClass("active").removeClass("dim");
       }
    });
});

