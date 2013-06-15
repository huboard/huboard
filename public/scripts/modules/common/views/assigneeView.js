define(["../../common/events/postal", "text!../templates/assignee.html"], function(postal, template) {

  return Backbone.View.extend({
     el: $(".page-header-wrapper"),
     initialize: function(options){
       var self = this;
       self.data = options.data;
       self.render();
     },
     render: function() {
       var list = $(this.el).find("ol");
       var users = _(this.data.assignees).chain().map(function(assignee) {
         return $(_.template(template, assignee)).data("assignee",assignee);
       }).value();
       list.append(users);
       list.find("li").draggable({helper:"clone",scope: "assignee", zIndex:100, appendTo: 'body'});
       list.find("li").dblclick(function() {
         var login = $(this).data('login');
         var state = $(this).data('filter-state') || 0
         state = (state+1) % 3
         postal.publish("Filter.Simple", {
           condition: function(issue) { return issue.assignee && issue.assignee.login === login; },
           state: state
         });
         $(this).data('filter-state', state);
       });
       return this;
     }

  });

});
