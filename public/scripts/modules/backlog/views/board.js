define(["../collections/issues",
       "text!../templates/board.html",
       "./columnView",
       "./sidebarView",
       "./headerView",
       "./assigneeView",
       "../../common/events/postal",
       "./cssView"], 
       function (issues,
                 template,
                 columnView,
                 sidebarView,
                 headerView,
                 assigneeView,
                 postal) {

  var calculateTallest = function (){

    var tallest = _($("ul")).chain()
      .map(function(ul) {return $(ul).height(); })
      .reduce(function(tallest,height) { return height > tallest ? height : tallest; })
      .value();

    return tallest;
  };

  var animateDrawer = function (direction) {

    switch(direction) {
      case "open":
        $("#drawer")
          .find(".toggle-drawer").removeClass("arrow-right").addClass("arrow-left")
          .end()
          .animate({left: '+=270px'}, 300);
        $("#content").animate({"margin-left": "+=100px"},300);
        break;
      case "close":
        $("#drawer")
          .animate({left: '-=270px'}, 300, function(){
             $(this)
              .find(".toggle-drawer").removeClass("arrow-left").addClass("arrow-right")
              .end();
          });
        $("#content").animate({"margin-left": "-=100px"},300);
    }
  };


   return Backbone.View.extend( {
        el : $('#stage'),
        events: {
          "click .toggle-drawer" : "toggleDrawer"
        },
        initialize: function (params) {
           issues.bind("ondatareceived", this.onfetch, this);
           issues.fetch(params.user, params.repo);
           this.user = params.user;
           this.repo = params.repo;
           this.params = params;
           postal.subscribe("Opened.Issue", $.proxy(this.onOpened,this))
           postal.subscribe("Closed.Issue", $.proxy(this.onClosed,this))
        },
        onOpened: function() {
          this.resizeColumns();
        },
        onClosed: function() {
          this.resizeColumns();
        },
        onfetch: function(data) {

           var board = $(_.template(template, data)),
               noneBoard = board.clone(),
               noneColumn = data.unassigned,
               sidebar = new sidebarView({data:data,params:this.params}),
               searchView = new headerView(),
               assigneesView = new assigneeView({data:data, params: this.params}),
               self = this;
           
           $(noneBoard).append(new columnView({column: noneColumn, user:this.user,repo:this.repo}).render().el);

           _.each(data.milestones, function (label){
               var column = new columnView({column: label, user:self.user,repo:self.repo});
               var markup = $(column.render().el).css({width:260 + "px"});
               $(board).append(markup);
           });

           $("#stage").append(board);

           $(board).sortable({
              axis: "x",
              handle: "h3",
              cursor: "move",
               stop: $.proxy(this.fullStop,this),
               start: $.proxy(this.onStart,this),
               remove: $.proxy(this.onRemove, this),
               over: $.proxy(this.onOver, this),
               update: $.proxy(this.onStop, this)
           });

           $("#drawer","#main-stage")
              //.append(noneBoard)
              .append(sidebar.render().el)
              .find(".toggle-drawer").show();

           //$(".sidebar-wrapper").append(userFilter.render().el).show();
           $(".sidebar-wrapper")
             //.append(sidebar.render().el)
             .append(noneBoard)
           .show();

           $('[rel~="twipsy"]').tooltip({live:true});
           this.resizeColumns();
        },
        resizeColumns : function () {
           var tallest = calculateTallest();
           $("ul","#main-stage").css("min-height",tallest);
        },
        toggleDrawer : function (ev) {

          ev.preventDefault();

          var open = $(".toggle-drawer")
            .hasClass("arrow-left");

          open ? animateDrawer("close") : animateDrawer("open");
        },
        onReceive: function(ev, ui){
        },
        onRemove: function(ev, ui){
           // don't know if need yet
        },
        onOver: function(ev, ui){
        },
        onOut: function (ev, ui){
        },
        fullStop: function(ev, ui) {
         $(ui.item).removeClass("ui-state-dragging");
        },
        onStart: function(ev, ui) {
         $(ui.item).addClass("ui-state-dragging");
        },
        onStop : function(ev,ui){
          var elements = $(".backlog > div", this.el),
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
            .trigger("reorder", {order:currentData._data.order})  
            .data("milestone", currentData);  

        }
   });
});
