define(["text!../templates/card.tmpl"],function(template){

  return Backbone.View.extend({
     initialize: function ( params ) {
       this.issue = params.issue;
       this.render();
     },
     events: {
      "click h3" : "clicked"
     },
     render: function(){
       this.el =  _.template(template, this.issue);
       this.delegateEvents();
       return this;
     },
     clicked : function(){

       console.log("clicked");
     }

  });

});
