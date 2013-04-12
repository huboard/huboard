define(['../common/events/postal',"./views/card"], function (postal, card) {

  var app = {
    open: function () {
      $("body").addClass("fullscreen-open");
    },
    close: function () {
      $("body").removeClass("fullscreen-open");
    },
    init: function () {
      $(".fullscreen-wrapper > div").click(function (ev) {
        ev.stopPropagation();
      })

      $(".fullscreen-overlay").click(app.close);

      postal.subscribe("Card.Fullscreen",$.proxy(this.open, this));
    }
  };


  return {
    init: function (params) {
      app.card = new  card(params);

      $(this).append(app.card.el);

      app.init();
    }
  }

});
