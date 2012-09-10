define(["../collections/issues","text!../templates/board.html", "./columnView","./sidebarView","../events/postal"], 
       function (issues, template, columnView, sidebarView, postal) {

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
        $("#drawer").animate({left: '10px'}, 300);
        break;
      case "close":
        $("#drawer").animate({left: '270px'}, 300);
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
          if (!data.labels.length) {
             window.location.href = "/" + this.user + "/"+ this.repo + "/board/create";
             return;
          }

           var board = $(_.template(template, data)),
               noneBoard = board.clone(),
               noneColumn = _.first(data.labels),
               rest = _.rest(data.labels),
               sidebar = new sidebarView({data:data,params:this.params}),
               self = this;
           
           $("tr",noneBoard).append(new columnView({column: noneColumn, user:this.user,repo:this.repo}).render().el);

           var width = (100 / rest.length);

           _.each(rest, function (label){
               var column = new columnView({column: label, user:self.user,repo:self.repo});
               var markup = $(column.render().el).css({width:width + "%"});
               $("tr",board).append(markup);
           });

           $("#stage").append(board).find(".toggle-drawer").show();
           $("#drawer","#main-stage").append(noneBoard.removeClass("drop-shadow lifted").addClass("underneath"));

           //$(".sidebar-wrapper").append(userFilter.render().el).show();
           $(".sidebar-wrapper").append(sidebar.render().el).show();

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
            .toggleClass("arrow-left")
            .hasClass("arrow-left");

          open ? animateDrawer("close") : animateDrawer("open");
        }
   });
});
