define(["text!../templates/milestone.html","../models/milestone"],function(template, milestone){


  return Backbone.View.extend({
     initialize : function (params){
       params.milestone.html_url = params.milestone.url.replace(/.*\/repos\/(.*)\/milestones.*/, 'https://github.com/$1/issues?milestone=' + params.milestone.number + '&state=open');
       this.milestone = new milestone({model:params.milestone, user: params.user, repo: params.repo});
       _.bind(this, 'reorder', this.reorder);
     },
     tagName: "li",
     events: {
       "drop": "reorder",
       "click" : "reorder"
     },
     render: function () {
       $(this.el).html(_.template(template, this.milestone.attributes)).data("milestone",this.milestone.attributes);
       this.delegateEvents();
       return this;
     },
     reorder: function(ev,index) {
       this.milestone.save({order: index});
     }
  });

});
