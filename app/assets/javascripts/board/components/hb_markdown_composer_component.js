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
    }
    ev.preventDefault();
  }
})

module.exports = HbMarkdownComposerComponent;
