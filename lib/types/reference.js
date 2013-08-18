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