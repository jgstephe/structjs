var utils = require('../utils')
  , StructReference = require('./reference')
  , StructArray     = require('./array')

var StructStorage = module.exports = function(path, opts) {
  this.path = path
  if (opts instanceof StructReference) 
    opts = { offset: opts }
  opts = opts || {}
  Object.defineProperties(this, {
    _offset: { value: opts.offset, writable: true }
  })
}

StructStorage.prototype.read = function read(view, offset) {
  var parent = read.caller.parent
    , shift  = this.offsetFor(parent) || offset
  !function traverse(path, definition, target) {
    var step = path.shift(), type = definition[step]
    traverse.parent = target
    if (!path.length) {
      target[step] = type.read(view, shift)
    } else if (type instanceof StructArray) {
      target[step].forEach(function(target) {
        traverse(path.concat([]), type.struct._definition, target)
      })
    } else {
      traverse(path, type, target[step])
    }
  }(this.path.split('.'), parent._definition, parent)
}

StructStorage.prototype.write = function write(view, offset) {
  var parent = write.caller.parent, shift = 0
  this.setOffset(offset, parent)
  !function traverse(path, definition, target) {
    var step = path.shift(), type = definition[step]
    traverse.parent = target
    if (!path.length) {
      type.setOffset(shift, target)
      type.write(view, offset, target[step])
      shift += type.lengthFor(target, true) * type.sizeFor(target, true)
    } else if (type instanceof StructArray) {
      target[step].forEach(function(target) {
        traverse(path.concat([]), type.struct._definition, target)
      })
    } else {
      traverse(path, type, target[step])
    }
  }(this.path.split('.'), parent._definition, parent)
}

StructStorage.prototype.lengthFor = function() {
  return 1
}

StructStorage.prototype.sizeFor = function(parent, writing) {
  var size = 0
  !function traverse(path, definition, target) {
    var step = path.shift(), type = definition[step]
    traverse.parent = target
    if (!path.length) {
      size += type.lengthFor(target, writing) * type.sizeFor(target, writing)
    } else if (type instanceof StructArray) {
      target[step].forEach(function(target) {
        traverse(path.concat([]), type.struct._definition, target)
      })
    } else {
      traverse(path, type, target[step])
    }
  }(this.path.split('.'), parent._definition, parent)
  return size
}

utils.methodsFor(StructStorage.prototype, '_offset', 'offsetFor', 'setOffset')

function traversePath(argument) {
  // body...
}