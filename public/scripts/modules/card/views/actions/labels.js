define(["text!../../templates/actions/labels.html"], function (template) {

  var Labels =  Backbone.View.extend({
        initialize: function (data, issue) {
          this.data = data;
          this.issue = issue;
        },
        events : {
          "click li" : "update"
        },
        render : function () {

          var  issue = this.issue,
          postUrl = "/api/" +
            issue.attributes.repo.owner.login +
            "/" + issue.attributes.repo.name +
            "/issues/" + issue.attributes.number +
            "/update_labels";
          $(this.el)
          .append("<form action='" +  postUrl  + "'>")
          .find("form")
          .html(_.template(template, this.data));
          return this;
        },
        update : function (ev, ui) {
          var li = $(ev.currentTarget),
          span = li.find("span").toggleClass("active"),
          input = li.find("input");

          input.prop("checked", !input.prop("checked"));

          var $form =  $(this.el).find("form"),
          postData = $form.serialize();

          $.ajax({
            url : $form.attr("action"),
            data: postData,
            dataType: 'json',
            type: "POST"
          }).done(function (response) {
            console.log(response);
          });
        }
  });

  return {
    create : function (data, model){ 
      return new Labels(data, model);
    }
  }

});
