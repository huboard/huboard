import Ember from 'ember';

function serialize() {
    var result = {};
    for (var key in Ember.$.extend(true, {}, this))
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
           
        }else if (Object.prototype.toString(this[key]) === "[object Array]") {
          /* jshint ignore:start */
           result[key] = this[key].map(function (i){ return serialize.call(i); });
          /* jshint ignore:end */
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

export default Serializable;
