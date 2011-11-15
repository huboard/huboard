define(["text!../templates/card.tmpl"],function(template){

  return Backbone.View.extend({
     initialize: function ( params ) {
       this.issue = params.issue;
     },
     events: {
      "click" : "clicked"
     },
     render: function(){
       $(this.el).html( _.template(template, this.issue));
       return this;
     },
     clicked : function(){

       console.log("clicked");
     }

  });

});
