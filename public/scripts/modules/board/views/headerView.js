define(["../events/postal"], function(postal){

  return Backbone.View.extend({
     el: $(".header"),
     events: {
       "keyup input" : "onkeyup"
     },
     initialize: function(){
       var self = this;

       this.publish = _.debounce(function() {
          var val = $(self.el).find("input").val();
          postal.publish("Filter.Simple",{id: "search", condition: function(issue){
               return issue.title.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1;
          }, state:2});

       }, 300);
     },
     onkeyup : function(ev){
       this.publish();
     }

  });

});
