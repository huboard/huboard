define(["text!../templates/column.tmpl","./cardView"],function(template, CardView){

  var Column = Backbone.View.extend({
    initialize : function(params) {
      this.column = params.column;
    },
    render: function(){
      var column = $(_.template(template, this.column));

      _.each(this.column.issues, function(issue){
        var card = new CardView({issue : issue});
        column.append(card.render().el);
      });

      this.el = column;

      return this;
    },
    events: {
      "click h3" : "clicked"
    },
    clicked: function(){

      console.log("column:click");
    }
  });
  return Column;
});
