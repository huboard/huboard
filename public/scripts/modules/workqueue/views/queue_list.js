define(['text!../templates/queue.tmpl'],function(queueTemplate){
     return Backbone.View.extend({
          el: $('#workqueue'),
          initialize:function(){
             _.bindAll(this,'addToWip','addToQueue');
          },
          addToWip: function (feature) {
            var newFeature = $(_.template(queueTemplate,feature));
            //this.$('.wip').prepend(newFeature);
            this.$('.wip').prepend(newFeature);
          },
          addToQueue: function (feature) {

          }
     });
});
