exports.getter = function(obj, prop, name) {
  Object.defineProperty(obj, name, {
    enumerable: true,
    get: function() {
      if (!this[prop]) return 0
      if (typeof this[prop] === 'function')
        return this[prop].call(this.parent)
      return this[prop]
    }
  })
}

exports.options = function(opts) {
  if (typeof opts === 'object') {
    this._offset  = opts.offset
    this._length  = opts.length
    this._size    = opts.size
    this.external = opts.external === true
  } else {
    this._length  = opts
  }
}