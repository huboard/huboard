define(["text!../templates/column.html","./cardView"],function(template, CardView){

  var Column = Backbone.View.extend({
    initialize : function(params) {
      this.column = params.column;
      this.repo = params.repo;
      this.user = params.user;
      this.latched = false;
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
         remove: $.proxy(this.onRemove, this),
         over: $.proxy(this.onOver, this),
         update: $.proxy(this.onStop, this),
         out: $.proxy(this.onOut, this)
      });

      return this;
    },
    onReceive: function(ev, ui){
      $(ui.item).trigger("moved",this.column.index);
    },
    onRemove: function(ev, ui){
       // don't know if need yet
    },
    onOver: function(ev, ui){
       $("ul",this.el).addClass("ui-sortable-hover");
    },
    onOut: function (ev, ui){
       $("ul",this.el).removeClass("ui-sortable-hover");
    },
    onStop : function(ev,ui){
      var elements = $("li", this.el),
      index = elements.index(ui.item);

      if(index === -1) { return; }

      var first = index === 0,
      last = index === elements.size() - 1,
      currentElement = $(ui.item),
      currentData = currentElement.data("issue"),
      beforeElement = elements.get(index ? index - 1 : index),
      beforeIndex = elements.index(beforeElement),
      beforeData = $(beforeElement).data("issue"),
      afterElement = elements.get(elements.size() - 1 > index ? index + 1 : index),
      afterIndex = elements.index(afterElement),
      afterData = $(afterElement).data("issue"),
      current = currentData._data.order || currentData.number,
      before = beforeData._data.order || beforeData.number,
      after = afterData._data.order || afterData.number;

      if(first && last) {return;}
      
      if(first) {
        // dragged it to the top
        currentData._data.order = (after || 1)/2;
        currentElement
        .trigger("drop", currentData._data.order)  
        .data("issue", currentData);  
      } else if (last) {
        // dragged to the bottom
        currentData._data.order = (before + 1);
        currentElement
        .trigger("drop", currentData._data.order)  
        .data("issue", currentData);  
      }  else {
        currentData._data.order = (((after + before) || 1)/2);
        currentElement
        .trigger("drop", currentData._data.order)  
        .data("issue", currentData);  
      }
    }
  });
  return Column;
});
