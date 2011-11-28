define(["text!../templates/card.tmpl"],function(template){

  return Backbone.View.extend({
     initialize: function ( params ) {
       this.issue = params.issue;
     },
     events: {
      "moved" : "moved"
     },
     tagName:"li",
     render: function(){
       $(this.el).html( _.template(template, this.issue)).addClass("drop-shadow");
       return this;
     },
     moved: function(ev,index){

       console.log("moved to column", index);
     }
  });

});
