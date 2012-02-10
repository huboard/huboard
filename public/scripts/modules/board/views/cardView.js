define(["text!../templates/card.html","../models/card", "../events/postal"],function(template,card, postal){

  return Backbone.View.extend({
     initialize: function ( params ) {
       this.issue = new card({model:params.issue, user:params.user,repo: params.repo});
       _.bind(this,'moved',this.moved);
       _.bind(this,'drop',this.drop);
       postal.subscribe("Filter.*", $.proxy(this.filter, this));
     },
     events: {
      "moved" : "moved",
      "click .milestone": "publishFilter",
      "click .close": "closed",
      "drop" : "drop"
     },
     tagName:"li",
     render: function(){
       $(this.el).html( _.template(template, this.issue.attributes)).addClass("drop-shadow").data("issue",this.issue.attributes);
       return this;
     },
     moved: function(ev,index){
       this.issue.save({index: index});
     },
     closed: function(ev, index){
       this.issue.close({index: index});
       this.remove();
     },
     publishFilter: function() {
       var self = this;
       postal.publish("Filter.Milestone", 
                      function (issue) { 
                        return issue.milestone ? issue.milestone.number === self.issue.attributes.milestone.number : false;
                      });
     },
     filter: function (shouldFilter) {
       $(this.el).toggle(shouldFilter(this.issue.attributes));
     },
     drop: function(ev,order){
        this.issue.reorder({order:order});
     }
  });

});
