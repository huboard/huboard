define(["text!../templates/card.tmpl"],function(template){

  return Backbone.View.extend({
     initialize: function ( params ) {
       this.issues = params.issues;
     },
     render: function(){
       return _.template(template, {issues:this.issues || []});
     }
  });

});
