var StructReference = require('./types/reference')

exports.getter = function(obj, prop, name) {
  Object.defineProperty(obj, name, {
    enumerable: true,
    get: function() {
      if (!this[prop]) return 0
      if (this[prop] instanceof StructReference)
        return this[prop].get(this.parent)
      return this[prop]
    },
    set: function(newValue) {
      if (newValue instanceof StructReference)
        this[prop].set(this.parent, newValue)
      else this[prop] = newValue
    }
  })
}

exports.options = function(opts) {
  if (typeof opts === 'object') {
    this._offset      = opts.offset
    this._length      = opts.length
    this._size        = opts.size
    this.external     = opts.external === true
    this._storage     = opts.storage
    this.littleEndian = opts.littleEndian === true
  } else {
    this._length  = opts
  }
}