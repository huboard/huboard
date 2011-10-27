define(["../collections/milestones","text!../templates/milestone.tmpl"],function(milestones, template){
     return Backbone.View.extend({
          el : $('<ul>').addClass('milestones lifted drop-shadow').appendTo('#workqueue'),
          initialize: function(){
             milestones.bind("ondatareceived", this.onfetch, this);
             milestones.fetch("rauhryan","skipping_stones_repo");
          },
          onfetch: function(data){
            var self = this;
            _.each(data, function(milestone){
                 $(self.el).append(_.template(template,milestone));
            });
          }
     });
});
