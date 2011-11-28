define(["../collections/issues","text!../templates/board.tmpl", "./columnView"], function (issues, template, columnView) {

  var calculateTallest = function (){

    var tallest = _($("ul")).chain()
      .map(function(ul) {return $(ul).height(); })
      .reduce(function(tallest,height) { return height > tallest ? height : tallest; })
      .value();

    return tallest;
  };

   return Backbone.View.extend( {
        el : $('#stage'),
        initialize: function (params) {
           issues.bind("ondatareceived", this.onfetch, this);
           issues.fetch(params.user, params.repo);
           this.user = params.user;
           this.repo = params.repo;
        },
        onfetch: function(data) {
           var board = $(_.template(template, data)),
               noneBoard = board.clone(),
               noneColumn = _.first(data.labels),
               rest = _.rest(data.labels),
               self = this;
           
           $("tr",noneBoard).append(new columnView({column: noneColumn, user:this.user,repo:this.repo}).render().el);

           var width = (100 / rest.length);

           _.each(rest, function (label){
               var column = new columnView({column: label, user:self.user,repo:self.repo});
               var markup = $(column.render().el).css({width:width + "%"});
               $("tr",board).append(markup);
           });

           $("#stage").html(board);
           $(".sidebar","#main-stage").append(noneBoard);

           var tallest = calculateTallest();
           $("ul","#main-stage").css("min-height",tallest);
        }
   });
});
