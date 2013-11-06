define(["text!../templates/card.html","../models/card", "../../common/events/postal"],function(template,card, postal){

  return Backbone.View.extend({
    initialize: function ( params ) {
      this.issue = new card({model:params.issue, user:params.user,repo: params.repo});
      _.bind(this,'moved',this.moved);
      _.bind(this,'reorder',this.drop);

      postal.subscribe("Filter.Simple", $.proxy(this.simpleFilter, this));
      postal.subscribe("Filter.Complex", $.proxy(this.complexFilter, this));

      postal.socket(params.user + "/" + params.repo,"Moved." + params.issue.number, $.proxy(this.onMoved,this));
      postal.socket(params.user + "/" + params.repo,"Closed." + params.issue.number, $.proxy(this.onClosed,this));
      postal.socket(params.user + "/" + params.repo,"Assigned." + params.issue.number, $.proxy(this.onAssigned,this));
      postal.socket(params.user + "/" + params.repo,"Updated." + params.issue.number, $.proxy(this.onUpdated,this));

      this.filtersHash = { simple: {}, complex: {}};
    },
    events: {
      "moved" : "moved",
      "click .close": "closed",
      "drop": "dropped",
      "reorder" : "drop",
      "click .number" : "onNumber",
      "click" : "fullscreen"

    },
    tagName:"li",
    className: "is-draggable",
    onNumber: function (ev) {
      ev.stopPropagation();
    },
    onMoved: function(data){
      postal.publish("Moved.Socket." + data.index,{card: this});
    },
    onUpdated: function (data) {
         this.issue.attributes = _.extend(this.issue.attributes, data.issue);
         this.render();
         this.transition();
    },
    onClosed: function(){
      this.remove();
      postal.publish("Closed.Issue",{card: this});
    },
    setLastMoved: function (ev) {
      this._lastMoved = ev;
    },
    fullscreen: function (ev) {
      if(this._lastMoved && this._lastMoved.timeStamp == ev.timeStamp) {
        ev.stopPropagation();
        return;
      }
      postal.publish("Card.Fullscreen",this.issue);
    },
    render: function(){
      $(this.el).html( _.template(template, this.issue.attributes))
      .droppable({scope:"assignee",hoverClass:"assignee-accept"})
      .data("issue",this.issue.attributes)
      .data("_view", this);

      if(this.issue.attributes.repo.color){

        var color = $.Color("#" + this.issue.attributes.repo.color);

        var rgbacolor = "3px solid " + $.Color(color.alpha(0.5)).toRgbaString();
        $(this.el)
        .css({
          "border-left": rgbacolor
        });

      }
      return this;
    },
    moved: function(ev,index){
      this.issue.save({index: index});
    },
    dropped: function(ev, ui){
      var assignee =  $(ui.draggable).data("assignee");
      this.issue.assign(assignee);
      this.onAssigned({assignee: assignee});
    },
    onAssigned: function(data) {
         this.issue.attributes.assignee = data.assignee;
         this.render();
    },
    closed: function(ev, index){
      ev.preventDefault();
      ev.stopPropagation();
      this.issue.close({index: index});
      this.remove();
      postal.publish("Closed.Issue",{card: this});
    },
    transition: function() {

      var filters = [], self = this;
      setTimeout(function(){
        for(var key in self.filtersHash.simple) {
            filters.push(self.filtersHash.simple[key]);
        }
        var fade = _.filter(filters,function(f){ return f.state === 1;});
        var hide = _.filter(filters,function(f){ return f.state === 2;});
        if(_.any(hide,function(f){ return !f.condition(self.issue.attributes); })){
           $(self.el).addClass("hide").removeClass("dim active");
           return;
        }
        if(_.any(fade,function(f){ return !f.condition(self.issue.attributes); })){
           $(self.el).addClass("dim").removeClass("hide active");
           return;
        }

        $(self.el).removeClass("dim hide active");
        if(fade.length || hide.length) {
          $(self.el).addClass("active")
        };

      }, 0);

    },
    simpleFilter: function(message){
      var self = this;

      this.filtersHash.simple[message.id] = message;

      this.transition();
    },
    drop: function(ev,order){
      this.issue.reorder({order:order});
    }
  });

});
