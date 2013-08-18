var utils = require('../utils')

var StructStorage = module.exports = function(opts) {
  this.opts     = opts || {}
  this.contents = []
  this.$length  = 1
  Object.defineProperties(this, {
    _offset: { value: this.opts.offset, writable: true }
  })
}

utils.getter(StructStorage.prototype, '_offset', '$offset')

Object.defineProperty(StructStorage.prototype, '$size', {
  enumerable: true,
  get: function() {
    return this.contents.map(function(content) {
      var type = content.type
      return type.$length * type.$size
    }).reduce(function(lhs, rhs) {
      return lhs + rhs
    }, 0)
  }
})