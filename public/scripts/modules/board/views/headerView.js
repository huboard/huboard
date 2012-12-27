define(["../events/postal", "text!../templates/assignee.html"], function(postal, template){

  return Backbone.View.extend({
     el: $(".page-header-wrapper"),
     events: {
       "keyup input" : "onkeyup"
     },
     initialize: function(options){
       var self = this;
       self.data = options.data;

       this.publish = _.debounce(function() {
          var val = $(self.el).find("input").val();
          postal.publish("Filter.Simple",{id: "search", condition: function(issue){
               return issue.title.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1;
          }, state:2});

       }, 300);
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
     },
     onkeyup : function(ev){
       this.publish();
     }

  });

});
