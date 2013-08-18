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
      for (var prop in definition) {
        var type = definition[prop]
        type.parent = self
        type.write(view, offset, self[prop])
        if (!type.external) offset += type.$length * type.$size
      }
    }
    apply(definition)
  
    extensions.forEach(function(extension) {
      if (!extension.condition.call(self)) return
      apply(extension.extension)
    })

    return view.buffer
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
          return !definition[prop].external
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