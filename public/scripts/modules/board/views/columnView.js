define(["text!../templates/column.tmpl","./cardView"],function(template, CardView){

  var Column = Backbone.View.extend({
    initialize : function(params) {
      this.column = params.column;
      this.render();
    },
    render: function(){
      var column = $(_.template(template, this.column));

      _.each(this.column.issues, function(issue){
        var card = new CardView({issue : issue});
        column.append(card.el);
        card.delegateEvents();
      });

      this.el = column;

      return this;
    }
  });
  return Column;
});
