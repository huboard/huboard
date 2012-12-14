define(["../events/postal"], function(postal) {
    jQuery.Color.fn.contrastColor = function() {
        var r = this._rgba[0], g = this._rgba[1], b = this._rgba[2];
        return (((r*299)+(g*587)+(b*144))/1000) >= 131.5 ? "black" : "white";
    };

    return Backbone.View.extend({
       tagName: "li",
       className: "filter",
       initialize: function(params) {
            this.params = params;
            this.condition = params.condition;
            this.color = $.Color(params.color);
            this.name = params.name;
            this.state = 0;
            this.states = [0,1,2,0];
       },
       events: {
          "click" : "clicked",
          "clear" : "clear"
       },
       render: function() {
         $(this.el).html("<a href='#'>"+ this.name + "<span class='iconic x-alt'></span></a>").addClass("-x" + this.params.color.substring(1) );
         this.textColor = $(this.el).find("a").css("color");
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
         postal.publish("XFilter", { id: this.cid, condition: this.condition, state:this.state});
       },
       clear: function(){
         $(this.el).find("a").css({backgroundColor: "#fff", color:this.textColor})

       },
       fade: function(){
         $(this.el).find("a").css({backgroundColor: $.Color(this.color.alpha(0.5)).toRgbaString(), color: this.color.contrastColor()})

       },
       solid: function(){
         $(this.el).find("a").css({backgroundColor: this.color.toString(), color: this.color.contrastColor()})

       }
    });
});

