define(["text!../templates/column.tmpl","./cardView"],function(template, CardView){

  var Column = Backbone.View.extend({
    initialize : function(params) {
      this.column = params.column;
      this.repo = params.repo;
      this.user = params.user;
    },
    render: function(){
      var column = $(_.template(template, this.column)),
          self = this;

      _.each(this.column.issues, function(issue){
        var card = new CardView({issue : issue, user: self.user, repo: self.repo});
        $("ul",column).append(card.render().el);
      });

      this.el = column;

      $("ul",this.el).sortable({
         connectWith: ".sortable",
         placeholder: "ui-sortable-placeholder",
         receive: $.proxy(this.onReceive,this),
         remove: $.proxy(this.onRemove, this)
      });

      return this;
    },
    onReceive: function(ev, ui){
      $(ui.item).trigger("moved",this.column.index);
    },
    onRemove: function(ev, ui){
       // don't know if need yet
    }
  });
  return Column;
});
