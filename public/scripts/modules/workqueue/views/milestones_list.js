define(["./milestoneView"],function(milestoneView,milestones){

  return Backbone.View.extend({
    tagName: "div",
    className:"drop-shadow",
    initialize: function(params){
      this.user = params.user;
      this.repo = params.repo;
      this.status = params.status;
    },
    render: function() {

      $("<ul>")
        .addClass("milestones sortable")
        .sortable({
         receive: $.proxy(this.onReceive,this),
         stop: $.proxy(this.fullStop,this),
         start: $.proxy(this.onStart,this),
         remove: $.proxy(this.onRemove, this),
         over: $.proxy(this.onOver, this),
         update: $.proxy(this.onStop, this),
         out: $.proxy(this.onOut, this),
          connectWith: ".sortable",
           placeholder: "ui-sortable-placeholder"
        }).appendTo(this.el);

      return this;
    },
    onReceive: function(ev, ui){
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
    onfetch: function(data){
      var self = this;
      _.each(data, function(milestone){
        var view = new milestoneView({user: self.user, repo: self.repo,milestone:milestone});
        $("ul",self.el).append(view.render().el);
        view.delegateEvents();
      });
      $("[rel~='twipsy']").tooltip({live:true})
    },
    fullStop: function(ev, ui) {
     $(ui.item).removeClass("ui-state-dragging");
    },
    onStart: function(ev, ui) {
     $(ui.item).addClass("ui-state-dragging");
    },
    onStop : function(ev,ui){
      console.log("onStop");
      var elements = $("li", this.el),
      index = elements.index(ui.item);

      if(index === -1) { return; }

      var first = index === 0,
      last = index === elements.size() - 1,
      currentElement = $(ui.item),
      currentData = currentElement.data("milestone"),
      beforeElement = elements.get(index ? index - 1 : index),
      beforeIndex = elements.index(beforeElement),
      beforeData = $(beforeElement).data("milestone"),
      afterElement = elements.get(elements.size() - 1 > index ? index + 1 : index),
      afterIndex = elements.index(afterElement),
      afterData = $(afterElement).data("milestone"),
      current = currentData._data.order || currentData.number,
      before = beforeData._data.order || beforeData.number,
      after = afterData._data.order || afterData.number;

      // its the only one in the list
      if(first && last) {
        currentData._data.order = current;
      }
      else if(first) {
        // dragged it to the top
        var t = after || 1;
        currentData._data.order = (t - 1) > 0 ? (t - 1) : (t / 2);
      } else if (last) {
        // dragged to the bottom
        currentData._data.order = (before + 1);
      }  else {
        currentData._data.order = (((after + before) || 1)/2);
      }

      currentElement
        .trigger("drop", {order:currentData._data.order,status:this.status})  
        .data("milestone", currentData);  

    }
  });
});
