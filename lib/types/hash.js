var utils = require('../utils')

var StructHash = module.exports = function(struct, prop, length) {
  this.struct  = struct
  this.prop    = prop
  Object.defineProperties(this, {
    _length: { value: length, writable: true }
  })
  this.$size = (struct.$size || struct.prototype.$size) * (struct.$length || struct.prototype.$length)
}

StructHash.prototype.read = function(buffer, offset) {
  var hash = {}
  for (var i = 0, len =  this.$length; i < len; ++i) {
    var child = new this.struct
    child.parent = this.parent
    child.unpack(buffer, offset)
    offset += child.$length * child.$size
    hash[child[this.prop]] = child
  }
  return hash
}

utils.getter(StructHash.prototype, '_length', '$length')