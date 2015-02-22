function serialize() {
    var result = {};
    for (var key in $.extend(true, {}, this))
    {
        // Skip these
        if (key === 'isInstance' ||
        key === 'isDestroyed' ||
        key === 'isDestroying' ||
        key === 'concatenatedProperties' ||
        typeof this[key] === 'function')
        {
            continue;
        }
        if(this[key] && this[key].toString()[0] === "<" && this[key].toString()[this[key].toString().length - 1] === ">") {
           result[key] = serialize.call(this[key]);
           
        }else if (Object.prototype.toString(this[key]) == "[object Array]") {
           result[key] = this[key].map(function (i){ return serialize.call(i); });
        } else {
          result[key] = this[key];
        }
    }
    return result;

}

var Serializable = Ember.Mixin.create({
  serialize: function () {
    return serialize.call(this);
  }
});

module.exports = Serializable;
