define(["../../common/events/postal"], function(postal){

  return Backbone.View.extend({
     el: $(".page-header-wrapper"),
     events: {
       "keyup input" : "onkeyup"
     },
     initialize: function(options){
       var self = this,
           input = $(self.el).find("input");

       this.publish = _.debounce(function() {
          var val = input.val();
          postal.publish("Filter.Simple",{id: "search", condition: function(issue){
               return issue.title.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1;
          }, state:2});

       }, 300);

         postal.subscribe("Shortcut.Search", function () { input.focus(); });
     },
     onkeyup : function(ev){
       this.publish();
     }

  });

});
