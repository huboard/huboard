define(["text!../templates/assignee.html"], function(template){

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
       return this;
     }

  });

});
