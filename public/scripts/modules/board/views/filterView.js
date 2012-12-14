define(["../events/postal"], function(postal) {
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
            this.state = 0;
            this.states = [0,1,2,0];
       },
       events: {
          "click" : "clicked",
          "clear" : "clear",
          "click .iconic" : "clearAndPublish"
       },
       render: function() {
         $(this.el).html("<a href='#'>"+ this.name + "<span class='iconic x-alt'></span></a>").addClass("-x" + this.params.color.substring(1) );
         return this;
       },
       clicked : function(ev) {
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
         postal.publish("XFilter", { id: this.cid, condition: this.condition, state:this.state});
       },
       clearAndPublish: function(ev) {
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

