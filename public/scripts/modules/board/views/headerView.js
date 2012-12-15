define(["../events/postal"], function(postal){

  return Backbone.View.extend({
     el: $(".header"),
     events: {
       "keyup input" : "onkeyup"
     },
     initialize: function(){

     },
     onkeyup : function(ev){
        var val = $(this.el).find("input").val();
        postal.publish("XFilter",{id: "search", condition: function(issue){
             return issue.title.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1;
        }, state:2});
     }

  });

});
