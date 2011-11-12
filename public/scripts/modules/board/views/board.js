define(["../collections/issues","text!../templates/board.tmpl"], function (issues, template) {

   return Backbone.View.extend( {
        el : $('#stage'),
        initialize: function (params) {
           issues.bind("ondatareceived", this.onfetch, this);
           issues.fetch(params.user, params.repo);
        },
        onfetch: function(data) {
           $("#stage").html(_.template(template, data));
        }
   });
});
