define(["text!../templates/milestone.tmpl","../models/milestone"],function(template, milestone){


  return Backbone.View.extend({
     initialize : function (params){
       console.log(milestone)
       this.milestone = new milestone({model:params.milestone, user: params.user, repo: params.repo});
       _.bind(this, 'reorder', this.reorder);
     },
     tagName: "li",
     events: {
       "drop": "reorder",
       "click" : "reorder"
     },
     render: function () {
       $(this.el).html(_.template(template, this.milestone.attributes));
       this.delegateEvents();
       return this;
     },
     reorder: function(ev,index) {
       this.milestone.save({order: index});
     }
  });

});
