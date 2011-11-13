define(["text!../templates/column.tmpl","./cardView"],function(template, CardView){

  var Column = Backbone.View.extend({
    initialize : function(params) {
      this.column = params.column;
    },
    render: function(){
      var column = $(_.template(template, this.column)),
      card = new CardView({issues : this.column.issues});

      column.append(card.render());

      return column;
    }
  });
  return Column;
});
