var utils = require('../utils')

var StructHash = module.exports = function(struct, prop, length) {
  this.struct  = struct
  this.prop    = prop
  Object.defineProperties(this, {
    _length: { value: length, writable: true }
  })
}

StructHash.prototype.read = function read(buffer, offset) {
  var hash = {}, parent = read.caller.parent
  for (var i = 0, len = this.lengthFor(parent); i < len; ++i) {
    var child = new this.struct
    child.unpack(buffer, offset)
    offset += child.lengthFor(parent) * child.sizeFor(parent)
    hash[child[this.prop]] = child
  }
  return hash
}

StructHash.prototype.write = function write(buffer, offset, hash) {
  var keys = Object.keys(hash), parent = write.caller.parent
  this.setLength(keys.length, parent)
  for (var i = 0, len =  this.lengthFor(parent); i < len; ++i) {
    var child = hash[keys[i]]
    child.pack(buffer, offset)
    offset += child.lengthFor(parent) * child.sizeFor(parent)
  }
}

StructHash.prototype.sizeFor = function(parent) {
   return (this.struct.sizeFor ? this.struct.sizeFor(parent) : this.struct.prototype.sizeFor(parent))
        * (this.struct.lengthFor ? this.struct.lengthFor(parent) : this.struct.prototype.lengthFor(parent))
}

utils.methodsFor(StructHash.prototype, '_length', 'lengthFor', 'setLength')