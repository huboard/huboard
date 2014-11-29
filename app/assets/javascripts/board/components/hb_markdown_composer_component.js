var HbMarkdownComposerComponent = Ember.Component.extend({
  classNames: ["markdown-composer"],
  acceptedTypes: {
    "image/png": true,
    "image/gif": true,
    "image/jpeg": true,
    "image/svg" : true,
    "image/svg+xml": true
  },
  dragEnter: function(ev) {
    return false;
  },
  dragOver: function(ev) {
    return false;
  },
  dragLeave: function(ev) {
    return false;
  },
  drop: function(ev) {
    if(ev.stopPropagation) {
      ev.stopPropagation();
    }
    var file = ev.dataTransfer.files[0],
      holder = this.$();
    if(this.get("acceptedTypes")[file.type] === true) {
      var reader = new FileReader();
      reader.onload = function (event) {
        var image = new Image();
        image.src = event.target.result;
        image.width = 250; // a fake resize
        holder.append(image);
      };
      reader.readAsDataURL(file);

      Ember.$.getJSON("/api/uploads/asset")
      .then(function(response){
        response = response.uploader
        var fd = new FormData();
        fd.append('utf8', '✓')
        fd.append('key', response.key)
        fd.append('acl', response.acl)
        //fd.append('Content-Type', file.type)
        fd.append('AWSAccessKeyId', response.aws_access_key_id)
        fd.append('policy', response.policy)
        fd.append('signature', response.signature)
        fd.append('success_action_status', "201")
        fd.append('file', file)

        var request = new XMLHttpRequest();
        request.addEventListener('readystatechange', function(){
          if(request.readyState === 4) {
            debugger;
          }
        })

        request.open('POST', "https://s3-us-west-2.amazonaws.com/dev.huboard.com", true);
        request.send(fd);
      });

    }
    ev.preventDefault();
  }
})

module.exports = HbMarkdownComposerComponent;
