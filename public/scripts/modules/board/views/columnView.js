define(["text!../templates/column.tmpl","./cardView"],function(template, CardView){

  var Column = Backbone.View.extend({
    initialize : function(params) {
      this.column = params.column;
    },
    render: function(){
      var column = $(_.template(template, this.column));

      _.each(this.column.issues, function(issue){
        var card = new CardView({issue : issue});
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
    events: {
      "click h3" : "clicked"
    },
    onReceive: function(ev, ui){

      console.log("onreceive",this.column.index,ui);
      $(ui.item).trigger("moved",this.column.index);
    },
    onRemove: function(ev, ui){
      console.log("onremove",this.column.index);

    },
    clicked: function(){

      console.log("column:click");
    }
  });
  return Column;
});
