var utils = require('../utils')

var StructNumber = module.exports = function(read, write, length) {
  this.methods = { read: read, write: write }
  Object.defineProperties(this, {
    _offset: { value: null, writable: true },
    _length: { value: null, writable: true }
  })
  utils.options.call(this, length)
}

StructNumber.prototype.from = function(offset) {
  return new StructNumber(this.methods.read, this.methods.write, {
    length:  this.length,
    offset:  offset,
    external: true
  })
}

StructNumber.prototype.read = function(buffer, offset) {
  return buffer[this.methods.read](this.external ? this.$offset : offset)
}

utils.getter(StructNumber.prototype, '_offset', '$offset')

Object.defineProperties(StructNumber.prototype, {
  $length: { enumerable: true, value: 1 },
  $size:   { enumerable: true, get: function() { return this._length } }
})

