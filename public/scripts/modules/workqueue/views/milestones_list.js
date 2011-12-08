define(["./milestoneView","../collections/milestones"],function(milestoneView,milestones){

     return Backbone.View.extend({
          el : $('<ul>').addClass('milestones lifted drop-shadow').appendTo('#workqueue'),
          initialize: function(params){
             milestones.bind("ondatareceived", this.onfetch, this);
             milestones.fetch(params.user,params.repo);
             this.user = params.user;
             this.repo = params.repo;
             $(this.el).sortable({
               stop: $.proxy(this.onStop,this)
             });
          },
          onfetch: function(data){
            var self = this;
            _.each(data, function(milestone){
                 var view = new milestoneView({user: self.user, repo: self.repo,milestone:milestone});
                 $(self.el).append(view.render().el);
                 view.delegateEvents();
            });
            $("[rel~='twipsy']").twipsy({live:true})
          },
          onStop : function(ev,ui){
            $("li",this.el).each(function(index,element){
               $(element).trigger("drop",index);
            })
          }
     });
});
