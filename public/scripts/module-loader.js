jQuery(function($){
  $.ajaxSetup({cache:false});
  $("[data-module]").each(function(){
    var $this = $(this),
    module = $this.data("module");

    require({
      baseUrl: '/scripts/modules'
    }
    ,[module],
    function(module){
      module.init.call($this,($this.data("parameters")));
    });


  });
});
