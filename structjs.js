(function(e){if("function"==typeof bootstrap)bootstrap("struct",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeStruct=e}else"undefined"!=typeof window?window.Struct=e():global.Struct=e()})(function(){var define,ses,bootstrap,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var StructNumber    = require('./types/number')
  , StructString    = require('./types/string')
  , StructHash      = require('./types/hash')
  , StructArray     = require('./types/array')
  , StructReference = require('./types/reference')
  , StructStorage   = require('./types/storage')

var Struct = module.exports = function(definition) {
  var StructType = function() {
    Object.defineProperties(this, {
      _view:   { writable: true, value: null },
      _offset: { writable: true, value: null }
    })
  }
  
  var extensions = []
  StructType.extendIf = function(condition, extension) {
    extensions.push({ condition: condition, extension: extension })
    return this
  }
  
  StructType.prototype.unpack = function(view, offset) {
    if (!(view instanceof DataView))
      throw new Error('DataView expected')
    
    this._view   = view
    this._offset = offset

    if (!offset) offset = 0
    
    var self = this
    function apply(definition) {
      for (var prop in definition) {
        var type = definition[prop]
        type.parent = self
        if (type instanceof StructStorage) self[prop] = type
      }
      for (var prop in definition) {
        var type = definition[prop]
        if (type instanceof StructStorage) continue
        if (type.storage) type.storage.contents.push({
          type: type, struct: self, prop: prop
        })
        self[prop] = type.read(view, offset)
        if (!type.external) offset += type.$length * type.$size
      }
    }
    apply(definition)
  
    extensions.forEach(function(extension) {
      if (!extension.condition.call(self)) return
      apply(extension.extension)
    })
    
    if (typeof this.$initialize === 'function')
      this.$initialize()
    
    return this
  }

  StructType.prototype.pack = function(view, offset) {
    if (!view) view = new DataView(new ArrayBuffer(this.$length * this.$size))
    if (!offset) offset = 0

    var self = this
    function apply(definition) {
      var start = offset
      // write storage areas first
      for (var prop in definition) {
        var type = definition[prop]
        if (type.external || type.storage) continue
        if (type instanceof StructStorage) {
          type.$offset = offset
          !function() {
            var offset = 0
            type.contents.forEach(function(content) {
              var type = content.type
              type.parent = content.struct
              type.$offset = offset
              type.write(view, offset, content.struct[content.prop])
              offset += type.$length * type.$size
            })
          }()
        }
        offset += type.$length * type.$size
      }
      // write everything other than StructNumber second
      offset = start
      for (var prop in definition) {
        var type = definition[prop]
        if (type.external || type.storage || type instanceof StructStorage)
          continue
        if (!(type instanceof StructNumber))
          type.write(view, offset, self[prop])
        offset += type.$length * type.$size
      }
      // write StructNumber last
      offset = start
      for (var prop in definition) {
        var type = definition[prop]
        if (type.external || type.storage)
          continue
        if (type instanceof StructNumber)
          type.write(view, offset, self[prop])
        offset += type.$length * type.$size
      }
    }
    apply(definition)
  
    extensions.forEach(function(extension) {
      if (!extension.condition.call(self)) return
      apply(extension.extension)
    })

    return view.buffer.slice(0, offset)
  }
  
  Object.defineProperty(StructType.prototype, '$length', {
    enumerable: true,
    value: 1
  })
  
  Object.defineProperty(StructType.prototype, '$size', {
    enumerable: true,
    get: function() {
      return Object.keys(definition)
        .filter(function(prop) {
          return !definition[prop].external && !definition[prop].storage
        })
        .map(function(prop) {
          return definition[prop].$length * definition[prop].$size
        })
        .reduce(function(lhs, rhs) {
          return lhs + rhs
        }, 0)
    }
  })
  
  return StructType
}

Struct.Int8    = new StructNumber('getInt8',    'setInt8',    1)
Struct.Uint8   = new StructNumber('getUint8',   'setUint8',   1)
Struct.Int16   = new StructNumber('getInt16',   'setInt16',   2)
Struct.Uint16  = new StructNumber('getUint16',  'setUint16',  2)
Struct.Int32   = new StructNumber('getInt32',   'setInt32',   4)
Struct.Uint32  = new StructNumber('getUint32',  'setUint32',  4)
Struct.Float32 = new StructNumber('getFloat32', 'setFloat32', 4)
Struct.Float64 = new StructNumber('getFloat64', 'setFloat64', 8)

Struct.String = function(length) {
  return new StructString(length)
}

Struct.Hash = function(struct, key, length) {
  return new StructHash(struct, key, length)
}

Struct.Array = function(struct, length) {
  return new StructArray(struct, length)
}

Struct.Reference = Struct.Ref = function(prop) {
  return new StructReference(prop)
}

Struct.Storage = function(opts) {
  return new StructStorage(opts)
}
},{"./types/array":2,"./types/hash":3,"./types/number":4,"./types/reference":5,"./types/storage":6,"./types/string":7}],2:[function(require,module,exports){
var utils = require('../utils')

var StructArray = module.exports = function(struct, length) {
  this.struct = struct
  Object.defineProperties(this, {
    _length: { value: length, writable: true }
  })
  this.$size = (struct.$size || struct.prototype.$size) * (struct.$length || struct.prototype.$length)
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

StructArray.prototype.write = function(buffer, offset, arr) {
  this.$length = arr.length
  for (var i = 0, len = this.$length; i < len; ++i) {
    var child = arr[i]
    if (typeof this.struct === 'function') {
      child.pack(buffer, offset)
      offset += child.$length * child.$size
    } else {
      this.struct.write(buffer, offset, child)
      offset += this.struct.$length * this.struct.$size
    }
  }
}

utils.getter(StructArray.prototype, '_length', '$length')
},{"../utils":8}],3:[function(require,module,exports){
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

StructHash.prototype.write = function(buffer, offset, hash) {
  var keys = Object.keys(hash)
  this.$length = keys.length
  for (var i = 0, len =  this.$length; i < len; ++i) {
    var child = hash[keys[i]]
    child.pack(buffer, offset)
    offset += child.$length * child.$size
  }
}


utils.getter(StructHash.prototype, '_length', '$length')
},{"../utils":8}],4:[function(require,module,exports){
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

StructNumber.prototype.write = function(buffer, offset, value) {
  buffer[this.methods.write](this.external ? this.$offset : offset, value)
}

utils.getter(StructNumber.prototype, '_offset', '$offset')

Object.defineProperties(StructNumber.prototype, {
  $length: { enumerable: true, value: 1 },
  $size:   { enumerable: true, get: function() { return this._length } }
})


},{"../utils":8}],5:[function(require,module,exports){
var StructReference = module.exports = function(prop) {
  this.prop = prop
}

StructReference.prototype.get = function(parent) {
  if (!parent) return 0
  var value = parent[this.prop]
  if (value === undefined && parent.parent) return parent.parent[this.prop]
  else return value
}

StructReference.prototype.set = function(parent, value) {
  parent[this.prop] = value
}
},{}],6:[function(require,module,exports){
var utils = require('../utils')
  , StructReference = require('./reference')

var StructStorage = module.exports = function(opts) {
  if (opts instanceof StructReference)
    opts = { offset: opts }
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
      type.parent = content.struct
      return type.$length * type.$size
    }).reduce(function(lhs, rhs) {
      return lhs + rhs
    }, 0)
  }
})
},{"../utils":8,"./reference":5}],7:[function(require,module,exports){
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

},{"../utils":8}],8:[function(require,module,exports){
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
      if (this[prop] instanceof StructReference)
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
},{"./types/reference":5}]},{},[1])(1)
});
;