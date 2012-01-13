jQuery(function($){
  $.ajaxSetup({cache:false});
  $("[data-module]").each(function(){
    var $this = $(this),
    module = $this.data("module");

    require({
      baseUrl: '/scripts'
    }
    ,[module],
    function(module){
      module.init($this.data("parameters"));
    });


  });
});
