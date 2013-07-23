define(["../../common/events/postal", "text!../templates/assignee.html"], function(postal, template) {

  return Backbone.View.extend({
     el: $(".sidebar"),
     initialize: function(options){
       var self = this;
       self.data = options.data;
       self.state = 0;

       self.classes = [["",""],["dim","active"],["hide","active"]]

       self.render();

     },        
     events: {
       "click li" : "filter"
     },
     filter: function(ev){
         var self = this;
         var current = $(ev.currentTarget);
         
         var login = current.data('login');
         var state = self.state;
         state = (state+1) % 3
         postal.publish("Filter.Simple", {
           condition: function(issue) { return issue.assignee && issue.assignee.login === login; },
           state: state
         });

         if(state === 1) {
          self.$("li").removeClass("active inactive").addClass("dim");
          current.removeClass("dim").addClass("active");
         }

         if(state === 2) {
            self.$("li").removeClass("active inactive").addClass("inactive");
            current.removeClass("dim inactive").addClass("active");
         }

         if(state === 0 ) {
            self.$("li").removeClass("dim active inactive");

         }


         self.state = state;

     },
     render: function() {
       var list = $(this.el).find("ol");
       var users = _(this.data.assignees).chain().map(function(assignee) {
         return $(_.template(template, assignee)).data("assignee",assignee);
       }).value();
       list.append(users);
       list.find("li").draggable({helper:"clone",scope: "assignee", zIndex:100, appendTo: 'body'});
       return this;
     }

  });

});
