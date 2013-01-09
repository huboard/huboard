define(["../collections/issues","text!../templates/css.html"], function(issues, template) {

  issues.bind("ondatareceived", function(data) {
    
    var css = _.template(template,data),
        head = document.getElementsByTagName('head')[0],
        style = document.createElement('style');

        style.type = "text/css";

        if(style.styleSheet){
          style.styleSheet.cssText = css;
        } else {
          style.appendChild(document.createTextNode(css));
        }

    head.appendChild(style);

  });

});
