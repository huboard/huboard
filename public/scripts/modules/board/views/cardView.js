define(["text!../templates/card.tmpl","../models/card"],function(template,card){

  return Backbone.View.extend({
     initialize: function ( params ) {
       this.issue = new card({model:params.issue, user:params.user,repo: params.repo});
       _.bind(this,'moved',this.moved);
       console.log(this.issue);
     },
     events: {
      "moved" : "moved"
     },
     tagName:"li",
     render: function(){
       $(this.el).html( _.template(template, this.issue.attributes)).addClass("drop-shadow");
       return this;
     },
     moved: function(ev,index){
       this.issue.save({index: index});
     }
  });

});
