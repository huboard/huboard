define(["text!../templates/milestone.tmpl","../models/milestone"],function(template, milestone){


  return Backbone.View.extend({
     initialize : function (params){
       console.log(milestone)
       params.milestone.html_url = params.milestone.url.replace(/.*\/repos\/(\w+)\/(\w+)\/.*/, 'https://github.com/$1/$2/issues?milestone=' + params.milestone.number + '&state=open');
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
