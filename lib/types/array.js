var utils = require('../utils')

var StructArray = module.exports = function(struct, length) {
  this.struct  = struct
  Object.defineProperties(this, {
    _length: { value: length, writable: true }
  })
  this.$size = struct.$size
}

StructArray.prototype.read = function(buffer, offset) {
  var arr = []
  for (var i = 0, len = this.$length; i < len; ++i) {
    var child
    if (typeof this.struct === 'function') {
      child = new this.struct
      child.parent = this.parent
      child.unpack(buffer, offset)
      offset += child.$length * child.$size
    } else {
      child = this.struct.read(buffer, offset)
      offset += this.struct.$length * this.struct.$size
    }
    arr.push(child)
  }
  return arr
}

utils.getter(StructArray.prototype, '_length', '$length')