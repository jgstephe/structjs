var utils = require('../utils')

var StructString = module.exports = function(length) {
  Object.defineProperties(this, {
    _offset: { value: null, writable: true },
    _length: { value: null, writable: true },
    _size:   { value: null, writable: true }
  })
  utils.options.call(this, length)
  this.$size = this._size || 1
}

StructString.prototype.read = function(buffer, offset) {
  var str = []
    , shift = this.external
      ? this.$offset
      : (this.storage ? this.storage.$offset + this.$offset: offset)
  for (var i = 0, len = this.$length, step = this.$size === 2 ? 2 : 1; i < len; i += step) {
    str.push(buffer[this.$size === 2 ? 'getUint16' : 'getUint8'](shift + i, this.littleEndian))
  }
  return String.fromCharCode.apply(null, str)
}

StructString.prototype.write = function(buffer, offset, value) {
  var str = []
    , shift = this.external
      ? this.$offset
      : (this.storage ? this.storage.$offset + this.$offset: offset)
  for (var i = 0, len = this.$length, step = this.$size === 2 ? 2 : 1; i < len; i += step) {
    var code = value.charCodeAt(i) || 0x00
    buffer[this.$size === 2 ? 'setUint16' : 'setUint8'](shift + i, code, this.littleEndian)
  }
}

utils.getter(StructString.prototype, '_length', '$length')
utils.getter(StructString.prototype, '_offset', '$offset')
utils.getter(StructString.prototype, '_storage', 'storage')
