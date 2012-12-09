define(["../events/postal"], function(postal) {

    return Backbone.View.extend({
       tagName: "li",
       className: "filter",
       initialize: function(params) {
            this.condition = params.condition;
            this.color = params.color;
            this.name = params.name;
            this.state = 0;
            this.states = [0,1,2,0];
       },
       events: {
          "click" : "clicked"
       },
       render: function() {
         $(this.el).html("<a href='#'>"+ this.name + "</a>");
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
         $(this.el).css({backgroundColor: "#fff", color: "#333"})

       },
       fade: function(){
         $(this.el).css({backgroundColor: $.Color($.Color("#"+this.color).alpha(0.7)).toRgbaString(), color: "#333"})

       },
       solid: function(){
         $(this.el).css({backgroundColor: "#" + this.color, color: "#333"})

       }
    });
});

