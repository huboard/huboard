define(["../../common/events/postal"], function(postal){

  return Backbone.View.extend({
     el: $(".nav.breadcrumbs"),
     events: {
       "keyup input" : "onkeyup",
       "click .search" : "onClick"
     },
     initialize: function(options){
       var self = this,
           input = $(self.el).find("input");

       this.publish = _.debounce(function() {
          var val = input.val();
          val ? input.addClass("has-value") : input.removeClass("has-value");
          postal.publish("Filter.Simple",{id: "search", condition: function(issue){
               return [issue.number, issue.title, issue.number].join(" ").toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1;
          }, state:2});

       }, 300);

         postal.subscribe("Shortcut.Search", function () { input.focus(); });
     },
     onkeyup : function(ev){
       this.publish();
     },
     onClick: function () {
        $(this.el).find("input").focus();
     }

  });

});
